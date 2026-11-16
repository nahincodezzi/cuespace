import hmac
import hashlib
import time
import base64
import json
from typing import Dict, Any, Optional
from app.core.config import settings


def generate_signed_action_token(payload: Dict[str, Any], expires_in_seconds: int = 86400 * 7) -> str:
    """
    Generates a cryptographically signed, tamper-proof token for 1-click email actions
    (such as 1-click Snooze for 3h/1d or Quick WhatsApp wish confirmation).
    """
    payload_copy = payload.copy()
    payload_copy["exp"] = int(time.time()) + expires_in_seconds
    
    serialized = json.dumps(payload_copy, separators=(",", ":"), sort_keys=True).encode("utf-8")
    b64_payload = base64.urlsafe_b64encode(serialized).decode("utf-8")
    
    signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        b64_payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    return f"{b64_payload}.{signature}"


def verify_signed_action_token(token: str) -> Optional[Dict[str, Any]]:
    """Verifies HMAC signature and expiration timestamp of the action token."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
            
        b64_payload, signature = parts[0], parts[1]
        
        expected_signature = hmac.new(
            settings.SECRET_KEY.encode("utf-8"),
            b64_payload.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            return None
            
        raw_json = base64.urlsafe_b64decode(b64_payload.encode("utf-8")).decode("utf-8")
        data = json.loads(raw_json)
        
        if data.get("exp", 0) < int(time.time()):
            return None  # Token expired
            
        return data
    except Exception:
        return None


def generate_snooze_token(event_id: str, snooze_hours: int = 3, expires_in_seconds: int = 86400 * 7) -> str:
    """Convenience wrapper to generate a 1-click snooze token for an event."""
    return generate_signed_action_token(
        payload={"event_id": str(event_id), "snooze_hours": snooze_hours},
        expires_in_seconds=expires_in_seconds
    )


def verify_snooze_token(token: str) -> Optional[Dict[str, Any]]:
    """Convenience wrapper to verify an action token."""
    return verify_signed_action_token(token)
