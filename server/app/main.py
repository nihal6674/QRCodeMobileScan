from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.scan import router as scan_router

app = FastAPI(title="Live Scan Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router, prefix="/api")

@app.get("/")
def health():
    return {"status": "ok"}
