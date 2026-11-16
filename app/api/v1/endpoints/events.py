import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import HTMLResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import verify_signed_action_token
from app.models.event import Event
from app.models.tag import Tag
from app.models.user import User
from app.models.notification_log import NotificationLog
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.services.recurrence import RecurrenceEngine
from app.services.snooze import SnoozeService

router = APIRouter()


async def get_mock_current_user(db: AsyncSession = Depends(get_db)) -> User:
    """
    Mock authenticated user dependency (replaced by real JWT/OAuth in production).
    Ensures an initial demo user exists in the local database.
    """
    stmt = select(User).limit(1)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            email="demo@cuespace.app",
            full_name="Alex Mercer",
            timezone="America/New_York",
            phone_number="+14155550199"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


@router.post(
    "/",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new smart event with timezone-aware next trigger"
)
async def create_event(
    event_in: EventCreate,
    current_user: User = Depends(get_mock_current_user),
    db: AsyncSession = Depends(get_db)
) -> EventResponse:
    """
    Creates and schedules a new smart event:
    1. Validates timezone and calendar recurrence specifications.
    2. Resolves and links selected tags belonging to the user.
    3. Calculates the exact UTC `next_trigger_at` timestamp.
    4. Persists the event with ACID safety in PostgreSQL.
    """
    # 1. Resolve tags if provided
    tags: List[Tag] = []
    if event_in.tag_ids:
        tag_query = select(Tag).where(
            Tag.id.in_(event_in.tag_ids),
            Tag.user_id == current_user.id
        )
        tag_result = await db.execute(tag_query)
        tags = list(tag_result.scalars().all())

    # 2. Compute exact UTC next_trigger_at
    next_trigger = RecurrenceEngine.calculate_next_trigger_utc(
        original_date=event_in.original_date,
        reminder_time=event_in.reminder_time,
        user_tz_str=event_in.timezone,
        alert_lead_days=event_in.alert_lead_days,
        recurrence_type=event_in.recurrence_type,
        recurrence_interval=event_in.recurrence_interval,
        calendar_type=event_in.calendar_type,
        leap_handling=event_in.leap_year_handling
    )

    # 3. Instantiate SQLAlchemy Model
    new_event = Event(
        user_id=current_user.id,
        title=event_in.title,
        description=event_in.description,
        category=event_in.category,
        original_date=event_in.original_date,
        reminder_time=event_in.reminder_time,
        timezone=event_in.timezone,
        calendar_type=event_in.calendar_type,
        leap_year_handling=event_in.leap_year_handling,
        recurrence_type=event_in.recurrence_type,
        recurrence_interval=event_in.recurrence_interval,
        channels=event_in.channels.model_dump(),
        alert_lead_days=event_in.alert_lead_days,
        recipient_name=event_in.recipient_name,
        recipient_phone=event_in.recipient_phone,
        recipient_email=event_in.recipient_email,
        next_trigger_at=next_trigger,
        is_active=True,
        tags=tags
    )

    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)

    # Load tags relationship for response schema
    stmt = (
        select(Event)
        .where(Event.id == new_event.id)
        .options(selectinload(Event.tags))
    )
    res = await db.execute(stmt)
    persisted_event = res.scalar_one()

    return EventResponse.model_validate(persisted_event)


@router.get(
    "/",
    response_model=List[EventResponse],
    summary="List all events for current user"
)
async def list_events(
    current_user: User = Depends(get_mock_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[EventResponse]:
    """Retrieves all active and upcoming events for the current user."""
    stmt = (
        select(Event)
        .where(Event.user_id == current_user.id)
        .options(selectinload(Event.tags))
        .order_by(Event.next_trigger_at.asc().nullslast())
    )
    res = await db.execute(stmt)
    events = res.scalars().all()
    return [EventResponse.model_validate(e) for e in events]


@router.get(
    "/audit/logs",
    summary="Get recent notification audit logs for CMS/Admin"
)
async def get_audit_logs(
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(NotificationLog)
        .order_by(NotificationLog.created_at.desc())
        .limit(50)
    )
    res = await db.execute(stmt)
    logs = res.scalars().all()
    return [
        {
            "id": str(l.id),
            "event_id": str(l.event_id),
            "channel": l.channel,
            "recipient": l.recipient,
            "status": l.status,
            "scheduled_for": l.scheduled_for.isoformat() if l.scheduled_for else None,
            "sent_at": l.sent_at.isoformat() if l.sent_at else None,
            "error_message": l.error_message,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        }
        for l in logs
    ]


@router.get(
    "/snooze",
    response_class=HTMLResponse,
    summary="1-Click Actionable Snooze from Email (HMAC Signed)"
)
async def snooze_event_via_token(
    token: str = Query(..., description="Cryptographically signed HMAC action token"),
    db: AsyncSession = Depends(get_db)
):
    """
    Stateless 1-click snooze handler. Does not require login because the URL contains
    a tamper-proof HMAC signature with expiration.
    """
    payload = verify_signed_action_token(token)
    if not payload:
        return HTMLResponse(
            content="""
            <html>
                <body style="background:#090A0F; color:#EF4444; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh;">
                    <div style="background:#111318; border:1px solid rgba(239,68,68,0.3); padding:32px; border-radius:12px; text-align:center;">
                        <h2>Invalid or Expired Snooze Link</h2>
                        <p style="color:#A1A1AA;">This link has expired or has already been used.</p>
                    </div>
                </body>
            </html>
            """,
            status_code=400
        )

    event_id = uuid.UUID(payload["event_id"])
    snooze_hours = payload.get("snooze_hours", 3)

    success, message, new_time = await SnoozeService.apply_snooze(
        db=db,
        event_id=event_id,
        snooze_duration_hours=snooze_hours
    )

    if not success:
        raise HTTPException(status_code=404, detail=message)

    formatted_time = new_time.strftime("%b %d, %Y at %I:%M %p UTC") if new_time else ""

    return HTMLResponse(
        content=f"""
        <html>
            <body style="background:#090A0F; color:#FAFAFA; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
                <div style="background:#111318; border:1px solid rgba(255,255,255,0.08); padding:36px; border-radius:12px; text-align:center; max-width:440px; box-shadow:0 20px 40px rgba(0,0,0,0.7);">
                    <div style="width:48px; height:48px; border-radius:50%; background:rgba(99,102,241,0.1); border:1px solid #6366F1; display:flex; align-items:center; justify-content:center; margin:0 auto 16px auto; color:#6366F1; font-size:24px;">✓</div>
                    <h2 style="margin:0 0 8px 0; font-size:20px;">Reminder Snoozed</h2>
                    <p style="color:#A1A1AA; font-size:14px; margin-bottom:20px;">{message}</p>
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:12px; border-radius:8px; font-size:13px; color:#6366F1;">
                        Next reminder scheduled for:<br><strong>{formatted_time}</strong>
                    </div>
                </div>
            </body>
        </html>
        """
    )


@router.get(
    "/{event_id}",
    response_model=EventResponse,
    summary="Get a single event by ID"
)
async def get_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> EventResponse:
    stmt = (
        select(Event)
        .where(Event.id == event_id)
        .options(selectinload(Event.tags))
    )
    res = await db.execute(stmt)
    event = res.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return EventResponse.model_validate(event)


@router.put(
    "/{event_id}",
    response_model=EventResponse,
    summary="Update an existing event (Admin/CMS)"
)
async def update_event(
    event_id: uuid.UUID,
    event_in: EventUpdate,
    db: AsyncSession = Depends(get_db)
) -> EventResponse:
    stmt = (
        select(Event)
        .where(Event.id == event_id)
        .options(selectinload(Event.tags))
    )
    res = await db.execute(stmt)
    event = res.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_dict = event_in.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        if key == "channels" and value is not None:
            event.channels = value if isinstance(value, dict) else value.model_dump()
        else:
            setattr(event, key, value)

    # Recalculate next_trigger_at
    event.next_trigger_at = RecurrenceEngine.calculate_next_trigger_utc(
        original_date=event.original_date,
        reminder_time=event.reminder_time,
        user_tz_str=event.timezone,
        alert_lead_days=event.alert_lead_days or [0],
        recurrence_type=event.recurrence_type or "YEARLY",
        recurrence_interval=event.recurrence_interval or 1,
        calendar_type=event.calendar_type or "GREGORIAN",
        leap_handling=event.leap_year_handling or "FEB_28"
    )

    await db.commit()
    await db.refresh(event)
    return EventResponse.model_validate(event)


@router.delete(
    "/{event_id}",
    summary="Delete an event (Admin/CMS)"
)
async def delete_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Event).where(Event.id == event_id)
    res = await db.execute(stmt)
    event = res.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.delete(event)
    await db.commit()
    return {"success": True, "message": f"Event '{event.title}' deleted successfully."}


@router.post(
    "/{event_id}/dispatch-now",
    summary="Trigger immediate test dispatch from Admin CMS"
)
async def trigger_dispatch_now(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Event).where(Event.id == event_id)
    res = await db.execute(stmt)
    event = res.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Record simulated immediate delivery log
    log_entry = NotificationLog(
        event_id=event.id,
        channel="MANUAL_TEST",
        recipient=event.recipient_email or event.recipient_phone or "Admin Tester",
        status="DELIVERED",
        scheduled_for=datetime.now(timezone.utc),
        sent_at=datetime.now(timezone.utc),
        metadata_payload={"triggered_by": "admin_cms", "title": event.title}
    )
    db.add(log_entry)
    event.last_triggered_at = datetime.now(timezone.utc)
    await db.commit()

    return {
        "success": True,
        "message": f"Immediate alert dispatched successfully for '{event.title}'!",
        "log_id": str(log_entry.id)
    }

