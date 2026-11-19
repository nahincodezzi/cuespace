from fastapi import APIRouter
from app.api.v1.endpoints import events, special_days

api_router = APIRouter()
api_router.include_router(events.router, prefix="/events", tags=["Events"])
api_router.include_router(special_days.router, prefix="/special-days", tags=["Special Days"])
