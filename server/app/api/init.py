import uuid
from fastapi import APIRouter
from app.utils.session import sign_session

router = APIRouter(tags=["init"])

@router.post("/init")
async def init_session():
    session_id = str(uuid.uuid4())
    session_token = sign_session(session_id)

    return {
        "session_id": session_id,
        "session_token": session_token
    }
