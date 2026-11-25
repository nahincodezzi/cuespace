from typing import Tuple
import logging
from twilio.rest import Client as TwilioClient
from app.core.config import settings

logger = logging.getLogger("cuespace.whatsapp")


def send_real_whatsapp(to_phone: str, message: str) -> Tuple[bool, str]:
    """
    Dispatches a real WhatsApp message using Twilio WhatsApp API when configured,
    or falls back to local sandbox simulation mode.
    
    Returns:
        (success: bool, status_message: str)
    """
    if (
        settings.TWILIO_ACCOUNT_SID 
        and not settings.TWILIO_ACCOUNT_SID.startswith("ACXXXX")
        and settings.TWILIO_AUTH_TOKEN
        and settings.TWILIO_WHATSAPP_NUMBER
    ):
        try:
            client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            
            from_num = settings.TWILIO_WHATSAPP_NUMBER.strip()
            if not from_num.startswith("whatsapp:"):
                from_num = f"whatsapp:{from_num}"
                
            clean_to = to_phone.strip()
            if not clean_to.startswith("whatsapp:"):
                clean_to = f"whatsapp:{clean_to}"
                
            msg = client.messages.create(
                body=message,
                from_=from_num,
                to=clean_to
            )
            sid = getattr(msg, "sid", "twilio_wa_sent")
            logger.info(f"Real WhatsApp delivered via Twilio to {to_phone} (SID: {sid})")
            return True, f"Real WhatsApp delivered via Twilio (SID: {sid})"
        except Exception as exc:
            err_msg = f"Twilio WhatsApp error: {str(exc)}"
            logger.error(f"Failed sending real WhatsApp to {to_phone}: {exc}")
            return False, err_msg
            
    logger.info(f"Local sandbox WhatsApp simulation for {to_phone} (Twilio credentials unset)")
    return True, f"Local sandbox simulation (Twilio credentials not configured in .env)"
