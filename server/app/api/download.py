from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from datetime import datetime
from pathlib import Path
from pydantic import BaseModel

from app.utils.token_store import get_token, invalidate_token

router = APIRouter()


class VerifyRequest(BaseModel):
    token: str
    pin: str


@router.post("/api/download/verify")
def verify_and_download(data: VerifyRequest):
    record = get_token(data.token)

    # 1️⃣ Token exists
    if not record:
        raise HTTPException(status_code=404, detail="Invalid or expired link")

    # 2️⃣ Expired
    if datetime.utcnow() > record["expires_at"]:
        raise HTTPException(status_code=403, detail="This link has expired")

    # 3️⃣ Already used
    if record["used"]:
        raise HTTPException(status_code=403, detail="This link has already been used")

    # 4️⃣ Locked due to too many attempts
    if record["locked"]:
        raise HTTPException(
            status_code=403,
            detail="This link has been locked due to multiple invalid PIN attempts"
        )

    # 5️⃣ PIN check
    if data.pin != record["pin"]:
        record["attempts"] += 1

        # Lock if max attempts reached
        if record["attempts"] >= record["max_attempts"]:
            record["locked"] = True
            raise HTTPException(
                status_code=403,
                detail="Too many invalid PIN attempts. This link has been locked."
            )

        remaining = record["max_attempts"] - record["attempts"]
        raise HTTPException(
            status_code=403,
            detail=f"Invalid PIN. {remaining} attempt(s) remaining."
        )

    # ✅ PIN correct → SUCCESS
    record["used"] = True
    file_path = Path(record["file_path"])

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not available")

    invalidate_token(data.token)

    return FileResponse(
        path=file_path,
        filename=file_path.name,
        media_type="application/pdf",
        background=lambda: file_path.unlink(missing_ok=True),
    )

# -----------------------------
# 1. PIN ENTRY PAGE
# -----------------------------
# @router.get("/download/{token}", response_class=HTMLResponse)
# def pin_entry_page(token: str):
#     record = get_token(token)

#     if not record:
#         return HTMLResponse(
#             "<h2>Link expired or invalid</h2>",
#             status_code=404
#         )

#     return f"""
#     <html>
#       <head>
#         <title>Secure Download</title>
#         <meta name="viewport" content="width=device-width, initial-scale=1" />
#         <style>
#           body {{
#             font-family: Arial, sans-serif;
#             background: #f5f5f5;
#             padding: 40px;
#           }}
#           .card {{
#             max-width: 400px;
#             margin: auto;
#             background: white;
#             padding: 24px;
#             border-radius: 8px;
#             box-shadow: 0 2px 8px rgba(0,0,0,0.1);
#           }}
#           input {{
#             width: 100%;
#             padding: 12px;
#             font-size: 16px;
#             margin: 12px 0;
#           }}
#           button {{
#             width: 100%;
#             padding: 12px;
#             font-size: 16px;
#             background: #2563eb;
#             color: white;
#             border: none;
#             border-radius: 4px;
#           }}
#         </style>
#       </head>
#       <body>
#         <div class="card">
#           <h2>Secure Document Download</h2>
#           <p>Please enter the PIN sent to your phone.</p>
#           <form method="post">
#             <input
#               type="password"
#               name="pin"
#               placeholder="Enter PIN"
#               required
#             />
#             <button type="submit">Download</button>
#           </form>
#         </div>
#       </body>
#     </html>
#     """


# -----------------------------
# 2. PIN VERIFICATION + DOWNLOAD
# -----------------------------
# @router.post("/download/{token}")
# def verify_pin_and_download(
#     token: str,
#     pin: str = Form(...)
# ):
#     record = get_token(token)

#     if not record:
#         raise HTTPException(status_code=404, detail="Invalid or expired link")

#     if record["used"]:
#         raise HTTPException(status_code=403, detail="Link already used")

#     if datetime.utcnow() > record["expires_at"]:
#         raise HTTPException(status_code=403, detail="Link expired")

#     if pin != record["pin"]:
#         raise HTTPException(status_code=403, detail="Invalid PIN")

#     file_path = Path(record["file_path"])

#     if not file_path.exists():
#         raise HTTPException(status_code=404, detail="File not available")

#     # 🔒 Invalidate token immediately
#     invalidate_token(token)

#     response = FileResponse(
#         path=file_path,
#         filename=file_path.name,
#         media_type="application/pdf",
#     )

#     # 🗑 Delete file after download
#     response.background = lambda: file_path.unlink(missing_ok=True)

#     return response
