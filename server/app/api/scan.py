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
import shutil
import asyncio

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.services.pdf_service import image_to_pdf
from app.services.email_service import send_email_with_attachment

# -----------------------------
# Router + Rate Limiter
# -----------------------------
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# -----------------------------
# Base temp directory (ephemeral)
# -----------------------------
BASE_TEMP_DIR = Path(tempfile.gettempdir()) / "live_scan"
BASE_TEMP_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/scan")
@limiter.limit("3/minute")
async def scan_form(
    request: Request,
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
    # 2. Validate file type
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
    # 4. Create per-request directory
    # -----------------------------
    request_id = str(uuid4())
    request_dir = BASE_TEMP_DIR / request_id
    request_dir.mkdir(parents=True, exist_ok=True)

    input_path = request_dir / "input.jpg"
    pdf_path = request_dir / "output.pdf"

    email_sent = False

    try:
        # -----------------------------
        # 5. Read + validate file size
        # -----------------------------
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with open(input_path, "wb") as f:
            f.write(contents)

        # -----------------------------
        # 6. Generate PDF directly
        # -----------------------------
        generated_pdf = image_to_pdf(input_path)
        shutil.move(generated_pdf, pdf_path)

        if not pdf_path.exists():
            raise RuntimeError("PDF generation failed")

        # -----------------------------
        # 7. Send email (non-blocking)
        # -----------------------------
        await asyncio.to_thread(
            send_email_with_attachment,
            to_emails=email_list,
            pdf_path=pdf_path,
        )

        email_sent = True

    except HTTPException:
        raise

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to process scan or send email"
        )

    finally:
        # -----------------------------
        # 8. Cleanup after success
        # -----------------------------
        if email_sent and request_dir.exists():
            shutil.rmtree(request_dir, ignore_errors=True)

    # -----------------------------
    # 9. Response
    # -----------------------------
    return {
        "status": "success",
        "sent_to": email_list,
    }






# from fastapi import (
#     APIRouter,
#     UploadFile,
#     File,
#     Form,
#     HTTPException,
#     Request,
# )
# from pathlib import Path
# from uuid import uuid4
# import tempfile
# import shutil
# import asyncio

# from slowapi import Limiter
# from slowapi.util import get_remote_address

# from app.services.image_processing import process_image
# from app.services.pdf_service import image_to_pdf
# from app.services.email_service import send_email_with_attachment


# # -----------------------------
# # Router + Rate Limiter
# # -----------------------------
# router = APIRouter()
# limiter = Limiter(key_func=get_remote_address)

# # -----------------------------
# # Base temp directory (ephemeral)
# # -----------------------------
# BASE_TEMP_DIR = Path(tempfile.gettempdir()) / "live_scan"
# BASE_TEMP_DIR.mkdir(parents=True, exist_ok=True)

# MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


# @router.post("/scan")
# @limiter.limit("3/minute")
# async def scan_form(
#     request: Request,               # required for slowapi
#     file: UploadFile = File(...),
#     consent: bool = Form(...),
#     emails: str = Form(...)
# ):
#     # -----------------------------
#     # 1. Validate consent
#     # -----------------------------
#     if not consent:
#         raise HTTPException(status_code=400, detail="Consent is required")

#     # -----------------------------
#     # 2. Validate file type
#     # -----------------------------
#     if not file.content_type or not file.content_type.startswith("image/"):
#         raise HTTPException(status_code=400, detail="Invalid image file")

#     # -----------------------------
#     # 3. Validate emails
#     # -----------------------------
#     email_list = [e.strip() for e in emails.split(",") if e.strip()]
#     if not email_list:
#         raise HTTPException(status_code=400, detail="At least one email required")

#     # -----------------------------
#     # 4. Create per-request directory
#     # -----------------------------
#     request_id = str(uuid4())
#     request_dir = BASE_TEMP_DIR / request_id
#     request_dir.mkdir(parents=True, exist_ok=True)

#     input_path = request_dir / "input.jpg"
#     processed_path = request_dir / "processed.jpg"
#     pdf_path = request_dir / "output.pdf"

#     email_sent = False

#     try:
#         # -----------------------------
#         # 5. Read + validate file size
#         # -----------------------------
#         contents = await file.read()
#         if len(contents) > MAX_FILE_SIZE:
#             raise HTTPException(status_code=413, detail="File too large")

#         with open(input_path, "wb") as f:
#             f.write(contents)

#         # -----------------------------
#         # 6. Image processing
#         # -----------------------------
#         processed_image_path = process_image(input_path)
#         shutil.move(processed_image_path, processed_path)

#         # -----------------------------
#         # 7. Generate PDF
#         # -----------------------------
#         generated_pdf = image_to_pdf(processed_path)
#         shutil.move(generated_pdf, pdf_path)

#         if not pdf_path.exists():
#             raise RuntimeError("PDF generation failed")

#         # -----------------------------
#         # 8. Send email (non-blocking)
#         # -----------------------------
#         await asyncio.to_thread(
#             send_email_with_attachment,
#             to_emails=email_list,
#             pdf_path=pdf_path,
#         )

#         email_sent = True

#     except HTTPException:
#         raise

#     except Exception as e:
#         print("ERROR:", str(e))
#         raise HTTPException(
#             status_code=500,
#             detail="Failed to process scan or send email"
#         )

#     finally:
#         # -----------------------------
#         # 9. Cleanup after success
#         # -----------------------------
#         if email_sent and request_dir.exists():
#             shutil.rmtree(request_dir, ignore_errors=True)

#     # -----------------------------
#     # 10. Response
#     # -----------------------------
#     return {
#         "status": "success",
#         "sent_to": email_list,
#     }  