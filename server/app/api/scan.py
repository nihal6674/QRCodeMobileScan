from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
from uuid import uuid4
import tempfile

from app.services.image_processing import process_image
from app.services.pdf_service import image_to_pdf


router = APIRouter()

# Ephemeral temp directory (OS-managed)
BASE_TEMP_DIR = Path(tempfile.gettempdir()) / "live_scan"
BASE_TEMP_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/scan")
async def scan_form(
    file: UploadFile = File(...),
    consent: bool = Form(...)
):
    # ----------------------------
    # 1. Validate consent
    # ----------------------------
    if not consent:
        raise HTTPException(
            status_code=400,
            detail="Consent is required"
        )

    # ----------------------------
    # 2. Validate file type
    # ----------------------------
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed"
        )

    # ----------------------------
    # 3. Save uploaded image temporarily
    # ----------------------------
    file_id = str(uuid4())
    input_path = BASE_TEMP_DIR / f"{file_id}.jpg"

    try:
        with open(input_path, "wb") as f:
            f.write(await file.read())
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to save uploaded image"
        )

    print("Saved to:", input_path)

    # ----------------------------
    # 4. Process image (crop, deskew, enhance)
    # ----------------------------
    try:
        processed_path = process_image(input_path)
        pdf_path = image_to_pdf(processed_path)
        print("PDF generated at:", pdf_path)

    except Exception as e:
        if input_path.exists():
            input_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=500,
            detail="Image processing failed"
        )

    print("Processed to:", processed_path)
    print("PDF path",pdf_path)

    # ----------------------------
    # 5. Return success
    # ----------------------------
    return {
    "status": "success",
    "file_id": file_id,
    "processed_file": processed_path.name,
    "pdf_file": pdf_path.name
    }

