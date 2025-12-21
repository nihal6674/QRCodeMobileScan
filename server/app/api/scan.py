from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from uuid import uuid4
from pathlib import Path

router = APIRouter()

UPLOAD_DIR = Path("temp/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/scan")
async def scan_form(
    file: UploadFile = File(...),
    consent: bool = Form(...),
):
    if not consent:
        raise HTTPException(status_code=400, detail="Consent is required")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type")

    filename = f"{uuid4()}.jpg"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as f:
        f.write(await file.read())

    return {
        "status": "uploaded",
        "file_id": filename
    }
