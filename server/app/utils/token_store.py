from datetime import datetime, timedelta
from uuid import uuid4
import random

# In-memory token store
DOWNLOAD_TOKENS = {}

DEFAULT_EXPIRY_MINUTES = 60


def create_download_token(file_path: str, expiry_minutes: int = DEFAULT_EXPIRY_MINUTES):
    token = str(uuid4())
    pin = str(random.randint(1000, 9999))  # 4-digit PIN
    expires_at = datetime.utcnow() + timedelta(minutes=expiry_minutes)

    DOWNLOAD_TOKENS[token] = {
    "token": token,
    "file_path": file_path,
    "pin": pin,
    "expires_at": expires_at,
    "used": False,
    "attempts": 0,
    "max_attempts": 3,
    "locked": False,
    }


    return token, pin


def get_token(token: str):
    record = DOWNLOAD_TOKENS.get(token)

    if not record:
        return None

    # ⏱ Auto-expire
    if datetime.utcnow() > record["expires_at"]:
        del DOWNLOAD_TOKENS[token]
        return None

    return record


def invalidate_token(token: str):
    if token in DOWNLOAD_TOKENS:
        DOWNLOAD_TOKENS[token]["used"] = True


def cleanup_expired_tokens():
    """Remove expired tokens from memory"""
    now = datetime.utcnow()
    expired_tokens = [
        token for token, record in DOWNLOAD_TOKENS.items()
        if record["expires_at"] < now
    ]

    for token in expired_tokens:
        del DOWNLOAD_TOKENS[token]
