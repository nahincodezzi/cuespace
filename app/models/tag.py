import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import TimeStampedUUIDModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.event import Event


class Tag(TimeStampedUUIDModel):
    __tablename__ = "tags"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    color: Mapped[str] = mapped_column(String(20), nullable=False, default="#6366F1")  # Hex color code
    icon: Mapped[str] = mapped_column(String(50), nullable=True)  # Lucide icon identifier e.g., 'briefcase', 'heart'

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="tags")
    events: Mapped[List["Event"]] = relationship(
        "Event",
        secondary="event_tags",
        back_populates="tags"
    )

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_user_tag_name"),
    )
