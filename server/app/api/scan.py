from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
from uuid import uuid4
import tempfile

from app.services.image_processing import process_image
from app.services.pdf_service import image_to_pdf
from app.services.email_service import send_email_with_attachment


router = APIRouter()

BASE_TEMP_DIR = Path(tempfile.gettempdir()) / "live_scan"
BASE_TEMP_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/scan")
async def scan_form(
    file: UploadFile = File(...),
    consent: bool = Form(...),
    emails: str = Form(...)
):
    if not consent:
        raise HTTPException(status_code=400, detail="Consent is required")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type")

    email_list = [e.strip() for e in emails.split(",") if e.strip()]
    if not email_list:
        raise HTTPException(status_code=400, detail="Email required")

    file_id = str(uuid4())
    input_path = BASE_TEMP_DIR / f"{file_id}.jpg"

    processed_path = None
    pdf_path = None
    email_sent = False

    try:
        # Save image
        with open(input_path, "wb") as f:
            f.write(await file.read())
        print("Saved to:", input_path)

        # Process image
        processed_path = process_image(input_path)
        print("Processed to:", processed_path)

        # Generate PDF
        pdf_path = image_to_pdf(processed_path)
        print("PDF generated at:", pdf_path)

        # Send email (PDF MUST EXIST HERE)
        send_email_with_attachment(
            to_emails=email_list,
            pdf_path=pdf_path
        )

        email_sent = True
        print("Email sent successfully")

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=500, detail="Scan or email failed")

    finally:
        # ✅ CLEANUP ONLY AFTER EMAIL SUCCESS
        if email_sent:
            for path in [input_path, processed_path, pdf_path]:
                if path and path.exists():
                    path.unlink(missing_ok=True)
            print("Temporary files deleted")

    return {
        "status": "success",
        "sent_to": email_list
    }
