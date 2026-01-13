import hmac
import hashlib
import os

SECRET = os.getenv("SESSION_SIGNING_SECRET")

def sign_session(session_id: str) -> str:
    return hmac.new(
        SECRET.encode(),
        session_id.encode(),
        hashlib.sha256
    ).hexdigest()

def verify_session(session_id: str, token: str) -> bool:
    expected = sign_session(session_id)
    return hmac.compare_digest(expected, token)
