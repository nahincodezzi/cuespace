import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class NotificationChannels(BaseModel):
    email: bool = True
    sms: bool = False
    whatsapp: bool = False


class NotificationLogResponse(BaseModel):
    id: uuid.UUID
    event_id: uuid.UUID
    channel: str
    recipient: str
    status: str
    scheduled_for: datetime
    sent_at: Optional[datetime] = None
    error_message: Optional[str] = None
    metadata_payload: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)
