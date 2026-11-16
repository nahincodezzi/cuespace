import uuid
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, example="Family")
    color: str = Field(default="#6366F1", pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", example="#EC4899")
    icon: Optional[str] = Field(default=None, example="heart")


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: uuid.UUID
    user_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
