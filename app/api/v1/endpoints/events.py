import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import HTMLResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_signed_action_token, generate_signed_action_token
from app.models.event import Event
from app.models.tag import Tag
from app.models.user import User
from app.models.notification_log import NotificationLog
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.schemas.notification import SmtpConfigRequest, TestEmailRequest
from app.services.recurrence import RecurrenceEngine
from app.services.snooze import SnoozeService
from app.services.email import send_real_email
from app.services.scheduler import get_live_alerts, clear_live_alerts

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
            "metadata_payload": l.metadata_payload or {},
        }
        for l in logs
    ]


@router.get("/live-alerts", summary="Get recent triggered live alerts for on-screen notification pop-up")
async def fetch_live_alerts():
    return get_live_alerts()


@router.post("/live-alerts/clear", summary="Clear or dismiss live alerts")
async def clear_alerts():
    clear_live_alerts()
    return {"success": True}


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

    channels = event.channels or {}
    now = datetime.now(timezone.utc)
    created_logs = []

    # 1. Email Channel Dispatch
    if channels.get("email", True) or event.recipient_email:
        recip_email = event.recipient_email or "recipient@cuespace.app"
        token_3h = generate_signed_action_token({"event_id": str(event.id), "snooze_hours": 3})
        token_24h = generate_signed_action_token({"event_id": str(event.id), "snooze_hours": 24})
        snooze_url_3h = f"{settings.BACKEND_URL}/api/v1/events/snooze?token={token_3h}"
        snooze_url_24h = f"{settings.BACKEND_URL}/api/v1/events/snooze?token={token_24h}"
        
        greeting_name = event.recipient_name or "Valued Guest"
        email_subject = f"CueSpace Reminder: {event.title}"
        email_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #0c0d14; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; color: #ededed;">
  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px; margin-bottom: 20px;">
    <span style="font-size: 13px; font-weight: 700; color: #818cf8; letter-spacing: 0.05em; text-transform: uppercase;">✨ CueSpace Autonomous Alert</span>
    <span style="font-size: 11px; color: #71717a;">{now.strftime('%b %d, %Y - %I:%M %p')} UTC</span>
  </div>
  <p style="font-size: 14px; color: #a1a1aa; margin: 0 0 8px 0;">Dear {greeting_name},</p>
  <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">{event.title}</h2>
  <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px; margin-bottom: 20px;">
    <p style="font-size: 13px; line-height: 1.6; color: #d4d4d8; margin: 0;">{event.description or 'Special milestone celebration scheduled in CueSpace.'}</p>
    <div style="margin-top: 10px; font-size: 11px; color: #a1a1aa;">
      <span>📅 Date: <strong>{event.original_date}</strong></span> &bull; 
      <span>⏰ Reminder Time: <strong>{event.reminder_time.strftime('%H:%M') if hasattr(event.reminder_time, 'strftime') else str(event.reminder_time)[:5]}</strong></span> &bull; 
      <span>🌍 Timezone: <strong>{event.timezone}</strong></span>
    </div>
  </div>
  <div style="margin-bottom: 24px;">
    <p style="font-size: 12px; color: #a1a1aa; margin: 0 0 10px 0;">Need to delay this alert? Use 1-click snooze below:</p>
    <div style="display: flex; gap: 8px;">
      <a href="{snooze_url_3h}" target="_blank" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 8px;">Snooze 3 Hours</a>
      <a href="{snooze_url_24h}" target="_blank" style="display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #ededed; text-decoration: none; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 8px;">Snooze 1 Day</a>
    </div>
  </div>
  <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 14px; font-size: 10px; color: #71717a;">
    Delivered automatically with timezone awareness by CueSpace &bull; Recipient: {recip_email}
  </div>
</div>"""

        # Attempt real dispatch if SMTP or Resend is enabled
        real_sent, dispatch_msg = send_real_email(
            to_email=recip_email,
            subject=email_subject,
            html_content=email_html
        )
        email_status = "DELIVERED" if real_sent else "FAILED"

        log_email = NotificationLog(
            event_id=event.id,
            channel="EMAIL",
            recipient=recip_email,
            status=email_status,
            scheduled_for=now,
            sent_at=now if real_sent else None,
            error_message=None if real_sent else dispatch_msg,
            metadata_payload={
                "subject": email_subject,
                "html_body": email_html,
                "recipient_name": greeting_name,
                "snooze_url_3h": snooze_url_3h,
                "snooze_url_24h": snooze_url_24h,
                "dispatch_message": dispatch_msg,
                "mode": "real_smtp" if settings.SMTP_ENABLED else "local_mock_dispatch"
            }
        )
        db.add(log_email)
        created_logs.append(f"Email ({email_status})")

    # 2. WhatsApp Channel Dispatch
    if channels.get("whatsapp", True) or event.recipient_phone:
        recip_phone = event.recipient_phone or "+8801700000000"
        greeting_name = event.recipient_name or "Friend"
        wa_text = f"🎉 *CueSpace Alert:* Wishing a very Happy {event.category.title()}, {greeting_name}! 🌟\n\nEvent: *{event.title}*\nScheduled Date: {event.original_date} ({event.timezone})\nNote: {event.description or 'No extra notes'}\n\n_Delivered via CueSpace Timezone Engine._"
        
        log_wa = NotificationLog(
            event_id=event.id,
            channel="WHATSAPP",
            recipient=recip_phone,
            status="DELIVERED",
            scheduled_for=now,
            sent_at=now,
            metadata_payload={
                "message_text": wa_text,
                "recipient_name": greeting_name,
                "phone": recip_phone,
                "mode": "local_mock_dispatch"
            }
        )
        db.add(log_wa)
        created_logs.append("WhatsApp (Simulated)")

    event.last_triggered_at = now
    await db.commit()

    return {
        "success": True,
        "message": f"Dispatched {', '.join(created_logs)} for '{event.title}'! You can view the message preview in Audit Logs.",
        "dispatched_channels": created_logs
    }


@router.get("/smtp/status", summary="Check Real Email & SMTP Configuration Status")
async def get_smtp_status():
    return {
        "smtp_enabled": settings.SMTP_ENABLED,
        "smtp_host": settings.SMTP_HOST,
        "smtp_port": settings.SMTP_PORT,
        "smtp_user": settings.SMTP_USER,
        "has_password": bool(settings.SMTP_PASSWORD),
        "is_configured": bool(settings.SMTP_ENABLED and settings.SMTP_USER and settings.SMTP_PASSWORD),
        "provider": "Gmail SMTP" if "gmail" in (settings.SMTP_HOST or "").lower() else "Custom SMTP"
    }


@router.post("/smtp/configure", summary="Configure SMTP settings (updates runtime and .env)")
async def configure_smtp(payload: SmtpConfigRequest):
    settings.SMTP_USER = payload.smtp_user.strip()
    settings.SMTP_PASSWORD = payload.smtp_password.strip()
    settings.SMTP_ENABLED = payload.smtp_enabled
    if payload.smtp_host:
        settings.SMTP_HOST = payload.smtp_host.strip()
    if payload.smtp_port:
        settings.SMTP_PORT = payload.smtp_port

    # Update .env file
    env_path = ".env"
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        updated_lines = []
        for line in lines:
            if line.startswith("SMTP_ENABLED="):
                updated_lines.append(f"SMTP_ENABLED={settings.SMTP_ENABLED}\n")
            elif line.startswith("SMTP_USER="):
                updated_lines.append(f'SMTP_USER="{settings.SMTP_USER}"\n')
            elif line.startswith("SMTP_PASSWORD="):
                updated_lines.append(f'SMTP_PASSWORD="{settings.SMTP_PASSWORD}"\n')
            elif line.startswith("SMTP_HOST="):
                updated_lines.append(f'SMTP_HOST="{settings.SMTP_HOST}"\n')
            elif line.startswith("SMTP_PORT="):
                updated_lines.append(f'SMTP_PORT={settings.SMTP_PORT}\n')
            else:
                updated_lines.append(line)
        
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(updated_lines)
    except Exception as e:
        pass

    return {
        "success": True,
        "message": f"SMTP settings saved! Sender: {settings.SMTP_USER} (Enabled: {settings.SMTP_ENABLED})",
        "status": {
            "smtp_enabled": settings.SMTP_ENABLED,
            "smtp_user": settings.SMTP_USER,
            "has_password": bool(settings.SMTP_PASSWORD)
        }
    }


@router.post("/test-email", summary="Send an immediate real test email to any recipient")
async def send_test_email(payload: TestEmailRequest):
    if not payload.recipient_email:
        raise HTTPException(status_code=400, detail="Recipient email is required")

    subject = payload.subject or "✨ CueSpace Real Email Dispatch Verification"
    html_body = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #0c0d14; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; color: #ededed;">
  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px; margin-bottom: 20px;">
    <span style="font-size: 13px; font-weight: 700; color: #818cf8; letter-spacing: 0.05em; text-transform: uppercase;">CueSpace Live Test</span>
    <span style="font-size: 11px; color: #71717a;">Real SMTP Active</span>
  </div>
  <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">🎉 Congratulations! Real Email is Working!</h2>
  <div style="background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 10px; padding: 16px; margin-bottom: 20px;">
    <p style="font-size: 13px; line-height: 1.6; color: #e0e7ff; margin: 0;">
      This email proves that CueSpace is successfully connected to your real email service and can automatically send timezone-aware reminders directly to real inboxes!
    </p>
  </div>
  <p style="font-size: 12px; color: #a1a1aa; margin: 0 0 16px 0;">
    Scheduled events, birthdays, anniversaries, and deadlines will now be delivered to your recipient's email right on schedule.
  </p>
  <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 14px; font-size: 10px; color: #71717a;">
    Sent from CueSpace Autonomous Engine &bull; Recipient: {payload.recipient_email}
  </div>
</div>"""

    success, msg = send_real_email(
        to_email=payload.recipient_email,
        subject=subject,
        html_content=html_body
    )

    return {
        "success": success,
        "message": msg,
        "recipient": payload.recipient_email
    }


