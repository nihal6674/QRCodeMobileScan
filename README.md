project-root/
│
├── client/                 # Frontend (mobile web app)
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
│
├── server/                 # Backend (FastAPI)
│   ├── app/
│   │   ├── api/
│   │   │   └── scan.py
│   │   ├── services/
│   │   │   ├── image_processing.py
│   │   │   ├── pdf_service.py
│   │   │   └── email_service.py
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── .gitignore
└── README.md




SMS Secure Link + PIN (Phase 2)
13. Secure Token + PIN Generation

Backend generates:

Download token (UUID)

PIN (4–6 digits)

Expiry time (e.g. 30 minutes)

Internal mapping (never exposed):

token → pdf_path → expires_at → pin → used=false

14. SMS Sent (No attachment)

SMS example:

“Your Live Scan form from The Loss Prevention Group, Inc. is ready.
Download securely: https://app.domain.com/download/abc123

PIN: 4821
Link expires in 30 minutes.”

✔ No PII in SMS
✔ No document attached

🔑 Secure Download Flow
15. Customer opens SMS link
GET /download/{token}


Backend response:

Shows PIN entry page

16. PIN Verification

Customer enters PIN → backend validates:

Token exists

Token not expired

PIN matches

Token not already used

❌ Any failure → access denied
✅ Success → proceed

17. File Download

PDF streamed securely

Content-Disposition: attachment

After download:

File deleted

Token marked as used

🧹 Cleanup & Security

Temp PDF auto-deleted

Token invalidated or expires

Consent already logged

Nothing publicly accessible

🔒 Security Guarantees (Why this is strong)

✔ Consent enforced server-side
✔ No public file URLs
✔ Expiring links
✔ PIN-protected access
✔ Rate-limited endpoints
✔ Minimal data retention
✔ Render-safe (ephemeral)

🧠 Client-ready one-liner

“For SMS delivery, we send a secure, expiring link protected by a one-time PIN, ensuring sensitive documents are never exposed via text messages.



Implementation Order (Next Steps)

1️⃣ Build /download/{token} endpoint
2️⃣ Add PIN verification page
3️⃣ Integrate Twilio SMS
4️⃣ Add expiry & cleanup logic