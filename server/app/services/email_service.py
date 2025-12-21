# import base64
# from pathlib import Path
# from sendgrid import SendGridAPIClient
# from sendgrid.helpers.mail import (
#     Mail,
#     Attachment,
#     FileContent,
#     FileName,
#     FileType,
#     Disposition,
# )

# # ⚠️ TEMPORARY – replace with .env later
# SENDGRID_API_KEY = 
# SENDGRID_FROM_EMAIL = 
# SENDGRID_FROM_NAME = 


# def send_email_with_attachment(
#     to_emails: list[str],
#     pdf_path: Path,
# ):
#     # Read PDF BEFORE cleanup
#     with open(pdf_path, "rb") as f:
#         encoded_pdf = base64.b64encode(f.read()).decode()

#     message = Mail(
#         from_email=(SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME),
#         to_emails=to_emails[0],  # single recipient for now
#         subject="Your Live Scan Form",
#         html_content="""
#             <p>Your scanned Live Scan form is attached as a PDF.</p>
#             <p>Please store it securely.</p>
#         """
#     )

#     attachment = Attachment(
#         FileContent(encoded_pdf),
#         FileName(pdf_path.name),
#         FileType("application/pdf"),
#         Disposition("attachment")
#     )

#     message.attachment = attachment

#     print(">>> SENDING EMAIL WITH PDF <<<")

#     sg = SendGridAPIClient(SENDGRID_API_KEY)
#     response = sg.send(message)

#     print("SendGrid status:", response.status_code)

#     if response.status_code not in (200, 202):
#         raise Exception("SendGrid rejected email")
