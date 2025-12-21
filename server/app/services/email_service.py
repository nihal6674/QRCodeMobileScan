import base64
import os
from pathlib import Path
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import (
    Mail,
    Attachment,
    FileContent,
    FileName,
    FileType,
    Disposition,
)

# -----------------------------
# Load environment variables
# -----------------------------
load_dotenv(".env")

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")
SENDGRID_FROM_NAME = os.getenv("SENDGRID_FROM_NAME", "The Loss Prevention Group, Inc.")

if not SENDGRID_API_KEY:
    raise RuntimeError("SENDGRID_API_KEY not set")

if not SENDGRID_FROM_EMAIL:
    raise RuntimeError("SENDGRID_FROM_EMAIL not set")


def send_email_with_attachment(
    to_emails: list[str],
    pdf_path: Path,
):
    # -----------------------------
    # Encode PDF
    # -----------------------------
    with open(pdf_path, "rb") as f:
        encoded_pdf = base64.b64encode(f.read()).decode()

    # -----------------------------
    # Create email (MULTI-RECIPIENT)
    # -----------------------------
    message = Mail(
        from_email=(SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME),
        to_emails=to_emails,  # ✅ LIST OF EMAILS (THIS IS THE KEY CHANGE)
        subject="Your Request for Live Scan Service Form",
        html_content="""
<p>Dear Customer,</p>

<p>
Attached is your completed <strong>Request for Live Scan Service</strong> form,
provided to you by <strong>The Loss Prevention Group, Inc.</strong>.
</p>

<p>
This document contains sensitive personal information. We recommend that you
download and store it securely for your records.
</p>

<p>
If you did not request this document or believe you have received it in error,
please contact us immediately and delete the attachment.
</p>

<p style="margin-top: 20px;">
Thank you for choosing <strong>The Loss Prevention Group, Inc.</strong><br/>
</p>

<hr style="margin: 20px 0;" />

<p style="font-size: 12px; color: #666;">
This email was sent at your request. The Loss Prevention Group, Inc. is not
responsible for unauthorized access resulting from the recipient’s email
security, shared access, or forwarding of this message.
</p>
        """,
    )

    # -----------------------------
    # Attach PDF
    # -----------------------------
    attachment = Attachment(
        FileContent(encoded_pdf),
        FileName(pdf_path.name),
        FileType("application/pdf"),
        Disposition("attachment"),
    )

    message.attachment = attachment

    # -----------------------------
    # Send email
    # -----------------------------
    sg = SendGridAPIClient(SENDGRID_API_KEY)
    response = sg.send(message)

    if response.status_code not in (200, 202):
        raise Exception("SendGrid rejected email")
