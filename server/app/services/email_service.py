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

# load env vars
load_dotenv(".env.example")  # or ".env" in production

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")
SENDGRID_FROM_NAME = os.getenv("SENDGRID_FROM_NAME")

if not SENDGRID_API_KEY:
    raise RuntimeError("SENDGRID_API_KEY not set")

def send_email_with_attachment(
    to_emails: list[str],
    pdf_path: Path,
):
    with open(pdf_path, "rb") as f:
        encoded_pdf = base64.b64encode(f.read()).decode()

    message = Mail(
        from_email=(SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME),
        to_emails=to_emails[0],
        subject="Your Live Scan Form",
        html_content="""
            <p>Your scanned Live Scan form is attached as a PDF.</p>
            <p>Please store it securely.</p>
        """
    )

    attachment = Attachment(
        FileContent(encoded_pdf),
        FileName(pdf_path.name),
        FileType("application/pdf"),
        Disposition("attachment"),
    )

    message.attachment = attachment

    sg = SendGridAPIClient(SENDGRID_API_KEY)
    response = sg.send(message)

    if response.status_code not in (200, 202):
        raise Exception("SendGrid rejected email")
