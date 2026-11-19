import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Tuple, Optional
import logging
import resend
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_real_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Sends a real transactional email to the recipient.
    Priority 1: Gmail SMTP / Custom SMTP (when SMTP_ENABLED is True and user/password are provided)
    Priority 2: Resend API (when RESEND_API_KEY is active)
    Priority 3: Local Sandbox Simulation (logs without sending over network)
    
    Returns:
        (success: bool, status_message: str)
    """
    # 1. Custom / Gmail SMTP
    if settings.SMTP_ENABLED and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            from_display = f"{settings.EMAILS_FROM_NAME} <{settings.SMTP_USER}>"
            msg["From"] = from_display
            msg["To"] = to_email
            msg["Subject"] = subject

            plain_text = text_content or "CueSpace reminder notification. Please view in an HTML-compatible client."
            msg.attach(MIMEText(plain_text, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            if settings.SMTP_PORT == 465:
                # SSL Port
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12)
            else:
                # TLS Port (standard 587)
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12)
                if settings.SMTP_USE_TLS:
                    server.starttls()

            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, [to_email], msg.as_string())
            server.quit()
            
            logger.info(f"Real email delivered via SMTP to {to_email}")
            return True, f"Real email delivered via SMTP to {to_email}"
        except Exception as exc:
            err_msg = f"SMTP error: {str(exc)}"
            logger.error(f"Failed sending email via SMTP to {to_email}: {exc}")
            return False, err_msg

    # 2. Resend API
    if settings.RESEND_API_KEY and not settings.RESEND_API_KEY.startswith("re_test"):
        try:
            resend.api_key = settings.RESEND_API_KEY
            params = {
                "from": f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }
            resp = resend.Emails.send(params)
            msg_id = resp.get("id", "resend_sent")
            logger.info(f"Real email delivered via Resend to {to_email} (ID: {msg_id})")
            return True, f"Real email delivered via Resend to {to_email} (ID: {msg_id})"
        except Exception as exc:
            err_msg = f"Resend API error: {str(exc)}"
            logger.error(f"Failed sending email via Resend to {to_email}: {exc}")
            return False, err_msg

    # 3. Local Sandbox Simulation
    logger.info(f"Local sandbox simulation for {to_email} (SMTP_ENABLED=False)")
    return True, f"Local sandbox simulation (Real SMTP is not yet enabled in .env)"
