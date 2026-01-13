import os
import json
import uuid
import hmac
import hashlib
from datetime import datetime, timezone

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from app.utils.session import verify_session
from app.utils.ip import get_client_ip
from app.utils.r2 import upload_json_to_r2

router = APIRouter(tags=["consent"])


class ConsentBase(BaseModel):
    session_id: str
    session_token: str


def sign_consent(data: dict) -> str:
    secret = os.getenv("CONSENT_SIGNING_SECRET")
    msg = json.dumps(data, sort_keys=True).encode()
    return hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()


def validate_session(payload: ConsentBase):
    try:
        uuid.UUID(payload.session_id)
    except ValueError:
        raise HTTPException(400, "Invalid session_id")

    if not verify_session(payload.session_id, payload.session_token):
        raise HTTPException(403, "Invalid session token")


@router.post("/consent/document")
async def document_consent(payload: ConsentBase, request: Request):
    validate_session(payload)

    timestamp = datetime.now(timezone.utc).isoformat()
    ip = get_client_ip(request)
    ua = request.headers.get("user-agent", "unknown")

    ip_hash = hashlib.sha256(
        (ip + os.getenv("IP_HASH_SALT", "")).encode()
    ).hexdigest()

    consent = {
        "consent_given": True,
        "consent_type": "document_handling",
        "consent_method": "checkbox",
        "consent_version": "doc_v1.0",
        "timestamp_utc": timestamp,
        "ip_hash": ip_hash,
        "user_agent": ua
    }

    consent["signature"] = sign_consent(consent)

    key = f"consents/session_{payload.session_id}/consent.document.json"
    await upload_json_to_r2(key, consent)

    return {"status": "ok"}


@router.post("/consent/sms")
async def sms_consent(payload: ConsentBase, request: Request):
    validate_session(payload)

    timestamp = datetime.now(timezone.utc).isoformat()
    ip = get_client_ip(request)
    ua = request.headers.get("user-agent", "unknown")

    ip_hash = hashlib.sha256(
        (ip + os.getenv("IP_HASH_SALT", "")).encode()
    ).hexdigest()

    consent = {
        "consent_given": True,
        "consent_type": "sms_transactional",
        "consent_method": "checkbox",
        "consent_scope": "one_time_transactional",
        "consent_version": "sms_v1.0",
        "timestamp_utc": timestamp,
        "ip_hash": ip_hash,
        "user_agent": ua
    }

    consent["signature"] = sign_consent(consent)

    key = f"consents/session_{payload.session_id}/consent.sms.json"
    await upload_json_to_r2(key, consent)

    return {"status": "ok"}
