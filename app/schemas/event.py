import uuid
from datetime import date, time, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator
import pytz
from app.schemas.tag import TagResponse
from app.schemas.notification import NotificationChannels


class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, example="Sarah's 30th Birthday")
    description: Optional[str] = Field(default=None, example="Prepare gift basket & send morning card")
    category: str = Field(default="birthday", example="birthday")
    original_date: date = Field(..., example="1996-05-15")
    reminder_time: time = Field(default=time(9, 0), example="09:00:00")
    timezone: str = Field(default="UTC", example="America/New_York")

    # Calendar & Recurrence
    calendar_type: str = Field(default="GREGORIAN", example="GREGORIAN")
    leap_year_handling: str = Field(default="FEB_28", example="FEB_28")
    recurrence_type: str = Field(default="YEARLY", example="YEARLY")
    recurrence_interval: int = Field(default=1, ge=1, example=1)

    # Multi-channel & alert leads
    channels: NotificationChannels = Field(default_factory=NotificationChannels)
    alert_lead_days: List[int] = Field(default=[0, 3], example=[0, 1, 3])

    # Recipient details
    recipient_name: Optional[str] = Field(default=None, example="Sarah Jenkins")
    recipient_phone: Optional[str] = Field(default=None, example="+14155552671")
    recipient_email: Optional[str] = Field(default=None, example="sarah.jenkins@example.com")

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, v: str) -> str:
        if v not in pytz.all_timezones:
            raise ValueError(f"Invalid timezone: '{v}'. Must be a standard IANA timezone.")
        return v

    @field_validator("calendar_type")
    @classmethod
    def validate_calendar(cls, v: str) -> str:
        valid = {"GREGORIAN", "HIJRI", "BENGALI"}
        if v.upper() not in valid:
            raise ValueError(f"Calendar must be one of {valid}")
        return v.upper()


class EventCreate(EventBase):
    tag_ids: Optional[List[uuid.UUID]] = Field(default_factory=list)


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    original_date: Optional[date] = None
    reminder_time: Optional[time] = None
    timezone: Optional[str] = None
    calendar_type: Optional[str] = None
    leap_year_handling: Optional[str] = None
    recurrence_type: Optional[str] = None
    recurrence_interval: Optional[int] = None
    channels: Optional[NotificationChannels] = None
    alert_lead_days: Optional[List[int]] = None
    recipient_name: Optional[str] = None
    recipient_phone: Optional[str] = None
    recipient_email: Optional[str] = None
    is_active: Optional[bool] = None
    tag_ids: Optional[List[uuid.UUID]] = None

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in pytz.all_timezones:
            raise ValueError(f"Invalid timezone: '{v}'. Must be a standard IANA timezone.")
        return v

    @field_validator("calendar_type")
    @classmethod
    def validate_calendar(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid = {"GREGORIAN", "HIJRI", "BENGALI"}
            if v.upper() not in valid:
                raise ValueError(f"Calendar must be one of {valid}")
            return v.upper()
        return v

    @field_validator("recurrence_interval")
    @classmethod
    def validate_interval(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 1:
            raise ValueError("recurrence_interval must be >= 1")
        return v


class EventResponse(EventBase):
    id: uuid.UUID
    user_id: uuid.UUID
    next_trigger_at: Optional[datetime] = None
    last_triggered_at: Optional[datetime] = None
    snooze_until: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    tags: List[TagResponse] = []

    model_config = ConfigDict(from_attributes=True)
