import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import TimeStampedUUIDModel

if TYPE_CHECKING:
    from app.models.event import Event


class NotificationLog(TimeStampedUUIDModel):
    __tablename__ = "notification_logs"

    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    channel: Mapped[str] = mapped_column(String(20), nullable=False)  # EMAIL, SMS, WHATSAPP
    recipient: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="PENDING", index=True, nullable=False)  # PENDING, DELIVERED, FAILED, SNOOZED
    external_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # Resend message ID, Twilio SID
    scheduled_for: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_payload: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    # Relationships
    event: Mapped["Event"] = relationship("Event", back_populates="notification_logs")

    __table_args__ = (
        Index("idx_notification_logs_event_status", "event_id", "status"),
        Index("idx_notification_logs_scheduled", "scheduled_for", "status"),
    )
