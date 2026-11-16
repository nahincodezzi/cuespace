import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import Event
from app.models.notification_log import NotificationLog


class SnoozeService:
    @staticmethod
    async def apply_snooze(
        db: AsyncSession,
        event_id: uuid.UUID,
        snooze_duration_hours: int = 3
    ) -> Tuple[bool, Optional[str], Optional[datetime]]:
        """
        Snoozes an event by postponing its next_trigger_at and recording a log entry.
        Returns: (success, message, new_snooze_time)
        """
        result = await db.execute(select(Event).where(Event.id == event_id))
        event = result.scalar_one_or_none()

        if not event:
            return False, "Event not found", None

        new_trigger = datetime.now(timezone.utc) + timedelta(hours=snooze_duration_hours)
        event.snooze_until = new_trigger
        event.next_trigger_at = new_trigger

        # Create audit log
        log_entry = NotificationLog(
            event_id=event.id,
            channel="SYSTEM",
            recipient=event.recipient_email or "User Action",
            status="SNOOZED",
            scheduled_for=new_trigger,
            metadata_payload={
                "action": "snooze",
                "duration_hours": snooze_duration_hours,
                "snooze_applied_at": datetime.now(timezone.utc).isoformat()
            }
        )
        db.add(log_entry)
        await db.commit()
        await db.refresh(event)

        return True, f"Event '{event.title}' successfully snoozed for {snooze_duration_hours} hour(s).", new_trigger
