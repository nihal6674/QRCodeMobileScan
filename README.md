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
