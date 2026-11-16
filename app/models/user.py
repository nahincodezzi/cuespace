import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import TimeStampedUUIDModel

if TYPE_CHECKING:
    from app.models.event import Event
    from app.models.tag import Tag


class User(TimeStampedUUIDModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)  # e.g., "America/New_York", "Asia/Dhaka"
    phone_number: Mapped[str] = mapped_column(String(30), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    google_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=True)

    # Relationships
    events: Mapped[List["Event"]] = relationship("Event", back_populates="user", cascade="all, delete-orphan")
    tags: Mapped[List["Tag"]] = relationship("Tag", back_populates="user", cascade="all, delete-orphan")
