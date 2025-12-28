import os
import asyncio


from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded

from app.utils.token_store import cleanup_expired_tokens
from app.api.scan import router as scan_router
from app.api.download import router as download_router



# -----------------------------
# ENV CONFIG
# -----------------------------
ENV = os.getenv("ENV", "development")

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173"
).split(",")

APP_TITLE = os.getenv("APP_TITLE", "Live Scan Backend")


# -----------------------------
# APP INIT
# -----------------------------
app = FastAPI(title=APP_TITLE)


# -----------------------------
# RATE LIMITER
# -----------------------------
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again shortly."},
    )


# -----------------------------
# CORS (ENV-AWARE)
# -----------------------------
if ENV == "development":
    # ⚠️ Local dev only
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # ✅ Production / staging
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["POST", "OPTIONS"],
        allow_headers=["*"],
    )


# -----------------------------
# ROUTES
# -----------------------------
app.include_router(scan_router, prefix="/api")
app.include_router(download_router)


@app.get("/", tags=["health"])
def health():
    return {"status": "ok"}

@app.on_event("startup")
async def start_cleanup_task():
    async def cleanup_loop():
        while True:
            cleanup_expired_tokens()
            await asyncio.sleep(60)  # every 1 minute

    asyncio.create_task(cleanup_loop())