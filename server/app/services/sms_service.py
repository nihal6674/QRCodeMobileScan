import os
from twilio.rest import Client

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER")

if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER]):
    raise RuntimeError("Twilio environment variables not set")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def send_sms(phone: str, download_url: str, pin: str, expiry_minutes: int = 60):
    message_body = (
        "Your Live Scan form from The Loss Prevention Group, Inc. is ready.\n\n"
        f"Secure download link:\n{download_url}\n\n"
        f"PIN: {pin}\n"
        f"This link expires in {expiry_minutes} minutes.\n\n"
        "Do not share this message."
    )

    message = client.messages.create(
        body=message_body,
        from_=TWILIO_FROM_NUMBER,
        to=phone,
    )

    return message.sid
