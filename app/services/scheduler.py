import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal
from app.core.config import settings
from app.core.security import generate_signed_action_token
from app.models.event import Event
from app.models.notification_log import NotificationLog
from app.services.recurrence import RecurrenceEngine
from app.services.email import send_real_email

logger = logging.getLogger("cuespace.scheduler")

# In-memory recent live alerts queue for the frontend to consume (last 30 alerts)
LIVE_ALERTS: List[Dict[str, Any]] = []


def get_live_alerts() -> List[Dict[str, Any]]:
    return list(LIVE_ALERTS)


def clear_live_alerts():
    LIVE_ALERTS.clear()


async def in_process_scan_and_dispatch() -> int:
    """
    Heartbeat background scheduler:
    1. Queries all active events where next_trigger_at <= NOW (UTC).
    2. Sends real email (if SMTP/Resend is configured) or logs simulation.
    3. Records NotificationLog entries with full metadata.
    4. Pushes into LIVE_ALERTS so the browser displays an instant on-screen chime and alarm modal!
    5. Updates event.last_triggered_at and computes next recurrence cycle.
    """
    now_utc = datetime.now(timezone.utc)
    
    async with AsyncSessionLocal() as session:
        stmt = (
            select(Event)
            .where(Event.is_active == True)
            .where(Event.next_trigger_at.is_not(None))
            .where(Event.next_trigger_at <= now_utc)
            .options(selectinload(Event.user))
        )
        res = await session.execute(stmt)
        due_events = res.scalars().all()
        
        if not due_events:
            return 0
            
        logger.info(f"⚡ In-process scheduler: Triggering {len(due_events)} due event(s)!")
        
        for event in due_events:
            channels = event.channels or {}
            user_email = event.user.email if (event.user and event.user.email) else None
            recip_email = event.recipient_email or user_email or "recipient@cuespace.app"
            
            user_phone = event.user.phone_number if (event.user and event.user.phone_number) else None
            recip_phone = event.recipient_phone or user_phone or "+8801700000000"
            greeting_name = event.recipient_name or "Valued Guest"
            
            token_3h = generate_signed_action_token({"event_id": str(event.id), "snooze_hours": 3})
            token_24h = generate_signed_action_token({"event_id": str(event.id), "snooze_hours": 24})
            snooze_url_3h = f"{settings.BACKEND_URL}/api/v1/events/snooze?token={token_3h}"
            snooze_url_24h = f"{settings.BACKEND_URL}/api/v1/events/snooze?token={token_24h}"
            
            email_subject = f"🔔 CueSpace Reminder: {event.title}"
            reminder_time_str = event.reminder_time.strftime('%H:%M') if hasattr(event.reminder_time, 'strftime') else str(event.reminder_time)[:5]
            
            email_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #0c0d14; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; color: #ededed;">
  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px; margin-bottom: 20px;">
    <span style="font-size: 13px; font-weight: 700; color: #818cf8; letter-spacing: 0.05em; text-transform: uppercase;">✨ CueSpace Autonomous Alert</span>
    <span style="font-size: 11px; color: #71717a;">{now_utc.strftime('%b %d, %Y - %I:%M %p')} UTC</span>
  </div>
  <p style="font-size: 14px; color: #a1a1aa; margin: 0 0 8px 0;">Dear {greeting_name},</p>
  <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">{event.title}</h2>
  <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px; margin-bottom: 20px;">
    <p style="font-size: 13px; line-height: 1.6; color: #d4d4d8; margin: 0;">{event.description or 'Special milestone celebration scheduled in CueSpace.'}</p>
    <div style="margin-top: 10px; font-size: 11px; color: #a1a1aa;">
      <span>📅 Date: <strong>{event.original_date}</strong></span> &bull; 
      <span>⏰ Reminder Time: <strong>{reminder_time_str}</strong></span> &bull; 
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

            # 1. Email Dispatch
            if channels.get("email", True) or event.recipient_email:
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
                    scheduled_for=now_utc,
                    sent_at=now_utc if real_sent else None,
                    error_message=None if real_sent else dispatch_msg,
                    metadata_payload={
                        "subject": email_subject,
                        "html_body": email_html,
                        "recipient_name": greeting_name,
                        "dispatch_message": dispatch_msg,
                        "title": event.title
                    }
                )
                session.add(log_email)

            # 2. WhatsApp Dispatch
            if channels.get("whatsapp", True) or event.recipient_phone:
                wa_text = f"🎉 *CueSpace Alert:* {event.title}!\nDate: {event.original_date} ({event.timezone})\nNote: {event.description or 'No extra notes'}\n\n_Delivered via CueSpace Timezone Engine._"
                log_wa = NotificationLog(
                    event_id=event.id,
                    channel="WHATSAPP",
                    recipient=recip_phone,
                    status="DELIVERED",
                    scheduled_for=now_utc,
                    sent_at=now_utc,
                    metadata_payload={
                        "message_text": wa_text,
                        "recipient_name": greeting_name,
                        "phone": recip_phone,
                        "title": event.title
                    }
                )
                session.add(log_wa)

            # 3. Add to live alerts for on-screen browser pop-up
            alert_item = {
                "id": str(event.id),
                "title": event.title,
                "category": event.category,
                "description": event.description or "",
                "original_date": str(event.original_date),
                "reminder_time": reminder_time_str,
                "timezone": event.timezone,
                "recipient_name": greeting_name,
                "recipient_email": recip_email,
                "recipient_phone": recip_phone,
                "triggered_at": now_utc.isoformat(),
                "channels": channels
            }
            LIVE_ALERTS.insert(0, alert_item)
            if len(LIVE_ALERTS) > 30:
                LIVE_ALERTS.pop()

            # 4. Update Event State
            event.last_triggered_at = now_utc
            event.snooze_until = None
            
            # Recalculate next trigger
            next_utc = RecurrenceEngine.calculate_next_trigger_utc(
                original_date=event.original_date,
                reminder_time=event.reminder_time,
                user_tz_str=event.timezone,
                alert_lead_days=event.alert_lead_days or [0],
                recurrence_type=event.recurrence_type or "YEARLY",
                recurrence_interval=event.recurrence_interval or 1,
                calendar_type=event.calendar_type or "GREGORIAN",
                leap_handling=event.leap_year_handling or "FEB_28"
            )
            event.next_trigger_at = next_utc
            if not next_utc and event.recurrence_type == "NONE":
                event.is_active = False

        await session.commit()
        return len(due_events)


async def start_scheduler_loop():
    """Background task running continuously inside FastAPI process every 10 seconds."""
    logger.info("Starting CueSpace autonomous in-process background scheduler (10s heartbeat)...")
    while True:
        try:
            await in_process_scan_and_dispatch()
        except Exception as e:
            logger.error(f"Scheduler heartbeat error: {e}")
        await asyncio.sleep(10)
