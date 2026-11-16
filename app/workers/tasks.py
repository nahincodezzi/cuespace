import asyncio
import uuid
import urllib.parse
from datetime import datetime, timezone
import redis
from celery.utils.log import get_task_logger
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
import resend
from twilio.rest import Client as TwilioClient

from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import generate_signed_action_token
from app.models.event import Event
from app.models.notification_log import NotificationLog
from app.services.recurrence import RecurrenceEngine

logger = get_task_logger(__name__)

# Initialize Sync Redis Client for Redlock / Distributed Locks
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# Provider initialization
if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY


@celery_app.task(name="app.workers.tasks.scan_and_dispatch_notifications")
def scan_and_dispatch_notifications():
    """
    Heartbeat Cron Job: Dispatched every 60s by Celery Beat.
    Acquires an atomic Redis lock to ensure single execution in multi-replica deployments.
    Queries all active events whose next_trigger_at <= NOW() in UTC.
    """
    lock_key = "cuespace:lock:scheduler_tick"
    # Acquire non-blocking lock with 50-second auto-expiry
    acquired = redis_client.set(lock_key, "locked", nx=True, ex=50)
    if not acquired:
        logger.info("Scheduler lock held by another worker instance. Skipping tick.")
        return "LOCK_SKIPPED"

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_async_scan_and_dispatch())


async def _async_scan_and_dispatch():
    now_utc = datetime.now(timezone.utc)
    logger.info(f"Scanning for events due up to {now_utc.isoformat()}...")

    async with AsyncSessionLocal() as session:
        # Fetch due events
        stmt = (
            select(Event)
            .where(Event.is_active == True)
            .where(Event.next_trigger_at <= now_utc)
            .options(selectinload(Event.user))
            .with_for_update(skip_locked=True)  # Prevent concurrency race conditions
        )
        result = await session.execute(stmt)
        due_events = result.scalars().all()

        dispatched_count = 0
        for event in due_events:
            dispatched_count += 1
            event_id_str = str(event.id)

            # Enqueue to channel queues
            if event.channels.get("email") and (event.recipient_email or event.user.email):
                recipient = event.recipient_email or event.user.email
                send_email_notification.delay(event_id_str, recipient)

            if event.channels.get("sms") and (event.recipient_phone or event.user.phone_number):
                phone = event.recipient_phone or event.user.phone_number
                send_sms_notification.delay(event_id_str, phone)

            if event.channels.get("whatsapp") and (event.recipient_phone or event.user.phone_number):
                phone = event.recipient_phone or event.user.phone_number
                send_whatsapp_notification.delay(event_id_str, phone)

            # Update event state: clear snooze, record last_triggered_at, and compute next cycle
            event.last_triggered_at = now_utc
            event.snooze_until = None
            next_utc = RecurrenceEngine.calculate_next_trigger_utc(
                original_date=event.original_date,
                reminder_time=event.reminder_time,
                user_tz_str=event.timezone,
                alert_lead_days=event.alert_lead_days,
                recurrence_type=event.recurrence_type,
                recurrence_interval=event.recurrence_interval,
                calendar_type=event.calendar_type,
                leap_handling=event.leap_year_handling
            )
            event.next_trigger_at = next_utc
            if not next_utc and event.recurrence_type == "NONE":
                event.is_active = False  # Completed one-off event

        await session.commit()
        logger.info(f"Dispatched {dispatched_count} events.")
        return f"DISPATCHED_{dispatched_count}"


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, name="app.workers.tasks.send_email_notification")
def send_email_notification(self, event_id: str, recipient_email: str):
    """Worker task for Resend HTML emails with 1-click snooze and action tokens."""
    loop = asyncio.get_event_loop() if not asyncio.get_event_loop().is_closed() else asyncio.new_event_loop()
    return loop.run_until_complete(_async_send_email(self, event_id, recipient_email))


async def _async_send_email(task, event_id: str, recipient_email: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Event).where(Event.id == uuid.UUID(event_id)))
        event = result.scalar_one_or_none()
        if not event:
            return

        # Generate HMAC 1-click snooze links (3 hours & 24 hours)
        token_3h = generate_signed_action_token({"event_id": event_id, "snooze_hours": 3})
        token_24h = generate_signed_action_token({"event_id": event_id, "snooze_hours": 24})
        snooze_url_3h = f"{settings.BACKEND_URL}/api/v1/events/snooze?token={token_3h}"
        snooze_url_24h = f"{settings.BACKEND_URL}/api/v1/events/snooze?token={token_24h}"

        # Actionable Direct Link (e.g. Pre-filled WhatsApp message)
        whatsapp_wish_link = None
        if event.recipient_phone:
            greeting_msg = urllib.parse.quote(f"Happy Birthday {event.recipient_name or ''}! Wishing you an amazing year ahead! 🎉")
            whatsapp_wish_link = f"https://wa.me/{event.recipient_phone.replace('+', '')}?text={greeting_msg}"

        # Linear / Vercel style dark-mode minimalist email template
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 32px; background-color: #090A0F; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #EDEDED;">
            <div style="max-width: 560px; margin: 0 auto; background: #111318; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 16px; margin-bottom: 24px;">
                    <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6366F1;">CueSpace Reminder</span>
                    <span style="font-size: 12px; color: #A1A1AA;">{datetime.now().strftime('%b %d, %Y')}</span>
                </div>
                <h1 style="font-size: 22px; font-weight: 600; color: #FAFAFA; margin: 0 0 12px 0;">{event.title}</h1>
                <p style="font-size: 14px; line-height: 1.6; color: #A1A1AA; margin: 0 0 24px 0;">{event.description or 'Upcoming special date event scheduled in CueSpace.'}</p>
                
                <div style="display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap;">
                    {f'<a href="{whatsapp_wish_link}" style="background-color: #25D366; color: #FFFFFF; font-size: 13px; font-weight: 500; text-decoration: none; padding: 9px 18px; border-radius: 6px; display: inline-block;">Send WhatsApp Wish</a>' if whatsapp_wish_link else ''}
                    <a href="{snooze_url_3h}" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); color: #EDEDED; font-size: 13px; font-weight: 500; text-decoration: none; padding: 9px 16px; border-radius: 6px; display: inline-block;">Snooze 3 Hours</a>
                    <a href="{snooze_url_24h}" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); color: #EDEDED; font-size: 13px; font-weight: 500; text-decoration: none; padding: 9px 16px; border-radius: 6px; display: inline-block;">Snooze 1 Day</a>
                </div>

                <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; font-size: 11px; color: #52525B;">
                    Delivered automatically with timezone awareness ({event.timezone}) by CueSpace.
                </div>
            </div>
        </body>
        </html>
        """

        external_id = None
        status = "DELIVERED"
        error_msg = None

        try:
            if settings.RESEND_API_KEY:
                params = {
                    "from": f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>",
                    "to": [recipient_email],
                    "subject": f"CueSpace Reminder: {event.title}",
                    "html": html_body,
                }
                resp = resend.Emails.send(params)
                external_id = resp.get("id")
            else:
                logger.warning(f"Simulating Resend email send to {recipient_email} (RESEND_API_KEY empty)")
                external_id = f"mock_{uuid.uuid4()}"
        except Exception as exc:
            status = "FAILED"
            error_msg = str(exc)
            logger.error(f"Failed sending email: {exc}")
            raise task.retry(exc=exc)

        # Log notification
        log = NotificationLog(
            event_id=event.id,
            channel="EMAIL",
            recipient=recipient_email,
            status=status,
            external_id=external_id,
            scheduled_for=datetime.now(timezone.utc),
            sent_at=datetime.now(timezone.utc) if status == "DELIVERED" else None,
            error_message=error_msg,
            metadata_payload={"resend_id": external_id}
        )
        session.add(log)
        await session.commit()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, name="app.workers.tasks.send_sms_notification")
def send_sms_notification(self, event_id: str, phone_number: str):
    """Worker task for Twilio SMS dispatch."""
    loop = asyncio.get_event_loop() if not asyncio.get_event_loop().is_closed() else asyncio.new_event_loop()
    return loop.run_until_complete(_async_send_sms(self, event_id, phone_number, is_whatsapp=False))


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, name="app.workers.tasks.send_whatsapp_notification")
def send_whatsapp_notification(self, event_id: str, phone_number: str):
    """Worker task for Twilio WhatsApp dispatch."""
    loop = asyncio.get_event_loop() if not asyncio.get_event_loop().is_closed() else asyncio.new_event_loop()
    return loop.run_until_complete(_async_send_sms(self, event_id, phone_number, is_whatsapp=True))


async def _async_send_sms(task, event_id: str, phone_number: str, is_whatsapp: bool = False):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Event).where(Event.id == uuid.UUID(event_id)))
        event = result.scalar_one_or_none()
        if not event:
            return

        body = f"CueSpace Reminder: {event.title} is today! {event.description or ''}"
        channel = "WHATSAPP" if is_whatsapp else "SMS"
        external_id = None
        status = "DELIVERED"
        error_msg = None

        try:
            if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
                client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                from_num = settings.TWILIO_WHATSAPP_NUMBER if is_whatsapp else settings.TWILIO_PHONE_NUMBER
                to_num = f"whatsapp:{phone_number}" if is_whatsapp else phone_number
                msg = client.messages.create(body=body, from_=from_num, to=to_num)
                external_id = msg.sid
            else:
                logger.warning(f"Simulating {channel} to {phone_number} (Twilio credentials unset)")
                external_id = f"mock_{uuid.uuid4()}"
        except Exception as exc:
            status = "FAILED"
            error_msg = str(exc)
            logger.error(f"Failed sending {channel}: {exc}")
            raise task.retry(exc=exc)

        log = NotificationLog(
            event_id=event.id,
            channel=channel,
            recipient=phone_number,
            status=status,
            external_id=external_id,
            scheduled_for=datetime.now(timezone.utc),
            sent_at=datetime.now(timezone.utc) if status == "DELIVERED" else None,
            error_message=error_msg,
            metadata_payload={"twilio_sid": external_id}
        )
        session.add(log)
        await session.commit()
