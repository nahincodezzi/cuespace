import uuid
from datetime import datetime, time, date, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.event import Event
from app.models.user import User
from app.api.v1.endpoints.events import get_mock_current_user
from app.services.recurrence import RecurrenceEngine
from app.services.special_days import get_all_special_days, RAW_SPECIAL_DAYS, resolve_special_day_date
from app.schemas.special_days import (
    SpecialDayItem,
    SpecialDaysListResponse,
    SubscribeSpecialDaysRequest,
    UnsubscribeSpecialDaysRequest
)

router = APIRouter()


@router.get(
    "/",
    response_model=SpecialDaysListResponse,
    summary="Get all Bangladesh and Worldwide special days for a given year"
)
async def list_special_days(
    year: int = Query(default=2026, ge=2020, le=2040),
    current_user: User = Depends(get_mock_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the enriched master catalog of Bangladesh and International special days
    (e.g., Mother Language Day, Pohela Boishakh, Women's Day, Men's Day, Mother's Day, Father's Day)
    with exact computed dates, countdowns, and subscription status for the current user.
    """
    # 1. Fetch user's existing events to cross-reference subscriptions
    stmt = select(Event).where(Event.user_id == current_user.id)
    res = await db.execute(stmt)
    user_events = res.scalars().all()

    # Map of special day ID -> event_id
    subscribed_map = {}
    for ev in user_events:
        if ev.description and "[Special Day: " in ev.description:
            try:
                tag_part = ev.description.split("[Special Day: ")[1].split("]")[0]
                subscribed_map[tag_part] = str(ev.id)
            except Exception:
                pass

    # 2. Compute enriched days for target year
    all_days = get_all_special_days(year=year)
    items = []
    subscribed_count = 0

    for d in all_days:
        day_id = d["id"]
        is_sub = day_id in subscribed_map
        if is_sub:
            subscribed_count += 1

        items.append(
            SpecialDayItem(
                **d,
                is_subscribed=is_sub,
                subscribed_event_id=subscribed_map.get(day_id)
            )
        )

    return SpecialDaysListResponse(
        year=year,
        total_count=len(items),
        subscribed_count=subscribed_count,
        special_days=items
    )


@router.post(
    "/subscribe",
    summary="Subscribe to selected special days with 1-2 day advance alerts"
)
async def subscribe_special_days(
    payload: SubscribeSpecialDaysRequest,
    current_user: User = Depends(get_mock_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Subscribes the user to one or more special days.
    Creates or updates yearly recurring events in CueSpace with automatic
    1-2 day lead time alerts (via Email and WhatsApp).
    """
    if not payload.day_ids:
        raise HTTPException(status_code=400, detail="No special days selected for subscription.")

    # Master map for definition lookup
    def_map = {item["id"]: item for item in RAW_SPECIAL_DAYS}
    subscribed_titles = []

    # Check existing user events to prevent duplicate creation
    stmt = select(Event).where(Event.user_id == current_user.id)
    res = await db.execute(stmt)
    existing_events = res.scalars().all()

    existing_by_special_id = {}
    for ev in existing_events:
        if ev.description and "[Special Day: " in ev.description:
            try:
                sid = ev.description.split("[Special Day: ")[1].split("]")[0]
                existing_by_special_id[sid] = ev
            except Exception:
                pass

    lead_days = payload.alert_lead_days or [1, 2]
    reminder_clock = time(9, 0, 0)  # 9:00 AM local time

    for day_id in payload.day_ids:
        if day_id not in def_map:
            continue

        day_def = def_map[day_id]
        exact_d = resolve_special_day_date(day_def, payload.year)
        
        # Calculate next trigger UTC
        next_trigger = RecurrenceEngine.calculate_next_trigger_utc(
            original_date=exact_d,
            reminder_time=reminder_clock,
            user_tz_str=payload.timezone,
            alert_lead_days=lead_days,
            recurrence_type="YEARLY",
            recurrence_interval=1,
            calendar_type="GREGORIAN",
            leap_handling="FEB_28"
        )

        title = f"{day_def['icon']} {day_def['title']}"
        desc = (
            f"{day_def['description']}\n\n"
            f"[Special Day: {day_id}]\n"
            f"Bengali: {day_def['title_bn']}\n"
            f"Advance Alert: {lead_days} day(s) before event.\n"
            f"Suggested Wish: {day_def.get('wish_template', '')}"
        )

        if day_id in existing_by_special_id:
            # Update existing event
            ev = existing_by_special_id[day_id]
            ev.title = title
            ev.description = desc
            ev.original_date = exact_d
            ev.channels = payload.channels
            ev.alert_lead_days = lead_days
            ev.recipient_email = payload.recipient_email or ev.recipient_email or current_user.email
            ev.recipient_phone = payload.recipient_phone or ev.recipient_phone or current_user.phone_number
            ev.recipient_name = payload.recipient_name or ev.recipient_name or current_user.full_name
            ev.timezone = payload.timezone
            ev.next_trigger_at = next_trigger
            ev.is_active = True
        else:
            # Create new recurring special day event
            new_event = Event(
                user_id=current_user.id,
                title=title,
                description=desc,
                category="holiday",
                original_date=exact_d,
                reminder_time=reminder_clock,
                timezone=payload.timezone,
                calendar_type="GREGORIAN",
                leap_year_handling="FEB_28",
                recurrence_type="YEARLY",
                recurrence_interval=1,
                channels=payload.channels,
                alert_lead_days=lead_days,
                recipient_name=payload.recipient_name or current_user.full_name,
                recipient_phone=payload.recipient_phone or current_user.phone_number,
                recipient_email=payload.recipient_email or current_user.email,
                next_trigger_at=next_trigger,
                is_active=True
            )
            db.add(new_event)

        subscribed_titles.append(day_def["title"])

    await db.commit()

    return {
        "success": True,
        "message": f"Successfully activated alerts for {len(subscribed_titles)} special day(s)! You will receive Email and WhatsApp reminders {lead_days} day(s) prior to each date.",
        "subscribed_days": subscribed_titles,
        "count": len(subscribed_titles)
    }


@router.post(
    "/unsubscribe",
    summary="Unsubscribe from special day notifications"
)
async def unsubscribe_special_days(
    payload: UnsubscribeSpecialDaysRequest,
    current_user: User = Depends(get_mock_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Removes notifications for the selected special days."""
    if not payload.day_ids:
        return {"success": True, "message": "Nothing to unsubscribe."}

    stmt = select(Event).where(Event.user_id == current_user.id)
    res = await db.execute(stmt)
    events = res.scalars().all()

    unsub_count = 0
    for ev in events:
        if ev.description and "[Special Day: " in ev.description:
            try:
                sid = ev.description.split("[Special Day: ")[1].split("]")[0]
                if sid in payload.day_ids:
                    await db.delete(ev)
                    unsub_count += 1
            except Exception:
                pass

    await db.commit()
    return {
        "success": True,
        "message": f"Unsubscribed from {unsub_count} special day(s).",
        "unsubscribed_count": unsub_count
    }
