import uuid
from datetime import datetime, date, time
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import (
    String, Text, Boolean, Date, Time, DateTime, Integer,
    ForeignKey, Table, Column, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimeStampedUUIDModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.tag import Tag
    from app.models.notification_log import NotificationLog

# Many-to-Many association table between Event and Tag
event_tags = Table(
    "event_tags",
    Base.metadata,
    Column("event_id", UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    Index("idx_event_tags_composite", "event_id", "tag_id")
)


class Event(TimeStampedUUIDModel):
    __tablename__ = "events"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="birthday")  # birthday, anniversary, deadline, custom

    # Date and Timezone Handling
    original_date: Mapped[date] = mapped_column(Date, nullable=False)  # Anchor date (e.g. 1996-02-29 or 2026-05-10)
    reminder_time: Mapped[time] = mapped_column(Time, default=time(9, 0), nullable=False)  # Local time in user's timezone (e.g. 09:00:00)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)  # User's local timezone (e.g. "America/New_York")

    # Calendar System
    calendar_type: Mapped[str] = mapped_column(String(20), default="GREGORIAN", nullable=False)  # GREGORIAN, HIJRI, BENGALI
    leap_year_handling: Mapped[str] = mapped_column(String(20), default="FEB_28", nullable=False)  # FEB_28, MARCH_1, EXACT_ONLY

    # Recurrence rules
    recurrence_type: Mapped[str] = mapped_column(String(20), default="YEARLY", nullable=False)  # NONE, DAILY, WEEKLY, MONTHLY, YEARLY, CUSTOM
    recurrence_interval: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Multi-Channel Configuration (JSONB)
    # Example: {"email": true, "sms": false, "whatsapp": true}
    channels: Mapped[dict] = mapped_column(JSONB, default=lambda: {"email": True, "sms": False, "whatsapp": False}, nullable=False)

    # Lead offsets in minutes or days: [0, 1, 2, 3] (on day, 1 day prior, 2 days prior, 3 days prior)
    alert_lead_days: Mapped[list] = mapped_column(JSONB, default=lambda: [0, 1, 2, 3], nullable=False)

    # Recipient overrides (e.g. spouse, client phone)
    recipient_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    recipient_phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    recipient_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Background Engine Dispatch Pointers
    # next_trigger_at is stored in UTC TIMESTAMPTZ for high-speed indexing by Celery Beat
    next_trigger_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), index=True, nullable=True)
    last_triggered_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    snooze_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="events")
    tags: Mapped[List["Tag"]] = relationship("Tag", secondary=event_tags, back_populates="events")
    notification_logs: Mapped[List["NotificationLog"]] = relationship(
        "NotificationLog", back_populates="event", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_events_scheduler", "is_active", "next_trigger_at"),
        Index("idx_events_user_category", "user_id", "category"),
    )
