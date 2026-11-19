from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class SpecialDayItem(BaseModel):
    id: str
    title: str
    title_bn: str
    category: str
    rule: str
    month: int
    day: int
    icon: str
    description: str
    tags: List[str]
    default_lead_days: List[int]
    wish_template: str
    year: int
    date: str
    month_name: str
    formatted_date: str
    days_until: int
    status: str
    is_subscribed: bool = False
    subscribed_event_id: Optional[str] = None


class SpecialDaysListResponse(BaseModel):
    year: int
    total_count: int
    subscribed_count: int
    special_days: List[SpecialDayItem]


class SubscribeSpecialDaysRequest(BaseModel):
    day_ids: List[str] = Field(..., description="List of special day IDs to subscribe to")
    year: int = Field(default=2026, description="Target calendar year")
    recipient_email: Optional[str] = None
    recipient_phone: Optional[str] = None
    recipient_name: Optional[str] = None
    channels: Dict[str, bool] = Field(default_factory=lambda: {"email": True, "whatsapp": True, "sms": False})
    alert_lead_days: List[int] = Field(default_factory=lambda: [1, 2], description="Days prior to send reminder, e.g. [1, 2]")
    timezone: str = Field(default="Asia/Dhaka", description="User target timezone")


class UnsubscribeSpecialDaysRequest(BaseModel):
    day_ids: List[str]
