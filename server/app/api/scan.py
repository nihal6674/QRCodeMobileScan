from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
    Request,
)
from pathlib import Path
from uuid import uuid4
import tempfile

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.services.image_processing import process_image
from app.services.pdf_service import image_to_pdf
from app.services.email_service import send_email_with_attachment


# -----------------------------
# Router + Rate Limiter
# -----------------------------
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# -----------------------------
# Temp directory (ephemeral)
# -----------------------------
BASE_TEMP_DIR = Path(tempfile.gettempdir()) / "live_scan"
BASE_TEMP_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/scan")
@limiter.limit("3/minute")   # 🔒 RATE LIMIT
async def scan_form(
    request: Request,        # REQUIRED for slowapi
    file: UploadFile = File(...),
    consent: bool = Form(...),
    emails: str = Form(...)
):
    # -----------------------------
    # 1. Validate consent
    # -----------------------------
    if not consent:
        raise HTTPException(status_code=400, detail="Consent is required")

    # -----------------------------
    # 2. Validate file
    # -----------------------------
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image file")

    # -----------------------------
    # 3. Validate emails
    # -----------------------------
    email_list = [e.strip() for e in emails.split(",") if e.strip()]
    if not email_list:
        raise HTTPException(status_code=400, detail="At least one email required")

    # -----------------------------
    # 4. Prepare paths
    # -----------------------------
    file_id = str(uuid4())
    input_path = BASE_TEMP_DIR / f"{file_id}.jpg"

    processed_path = None
    pdf_path = None
    email_sent = False

    try:
        # -----------------------------
        # 5. Save uploaded image
        # -----------------------------
        with open(input_path, "wb") as f:
            f.write(await file.read())
        print("Saved to:", input_path)

        # -----------------------------
        # 6. Image processing
        # -----------------------------
        processed_path = process_image(input_path)
        print("Processed to:", processed_path)

        # -----------------------------
        # 7. Generate PDF
        # -----------------------------
        pdf_path = image_to_pdf(processed_path)
        print("PDF generated at:", pdf_path)

        # -----------------------------
        # 8. Send email (PDF must exist)
        # -----------------------------
        send_email_with_attachment(
            to_emails=email_list,
            pdf_path=pdf_path,
        )

        email_sent = True
        print("Email sent successfully")

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to process scan or send email"
        )

    finally:
        # -----------------------------
        # 9. Cleanup ONLY after success
        # -----------------------------
        if email_sent:
            for path in [input_path, processed_path, pdf_path]:
                if path and path.exists():
                    path.unlink(missing_ok=True)
            print("Temporary files deleted")

    # -----------------------------
    # 10. Response
    # -----------------------------
    return {
        "status": "success",
        "sent_to": email_list,
    }
