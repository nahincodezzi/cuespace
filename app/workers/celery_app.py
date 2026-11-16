from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "cuespace_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 min hard limit
    worker_prefetch_multiplier=1,  # Fair distribution
    task_routes={
        "app.workers.tasks.scan_and_dispatch_notifications": {"queue": "scheduler"},
        "app.workers.tasks.send_email_notification": {"queue": "notifications_email"},
        "app.workers.tasks.send_sms_notification": {"queue": "notifications_sms"},
        "app.workers.tasks.send_whatsapp_notification": {"queue": "notifications_whatsapp"},
    },
    beat_schedule={
        "cron-tick-every-minute": {
            "task": "app.workers.tasks.scan_and_dispatch_notifications",
            "schedule": 60.0,  # Runs every minute
        },
    }
)
