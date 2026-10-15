import os
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Ensure root and backend directories are in sys.path
_current_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.dirname(_current_dir)
_root_dir = os.path.dirname(_backend_dir)
for _p in (_root_dir, _backend_dir):
    if _p not in sys.path:
        sys.path.insert(0, _p)

load_dotenv()

from backend.app.database.session import Base, engine
from backend.app.database.seed import seed_database
from backend.app.routers import (
    auth,
    public,
    admin_sports,
    admin_events,
    admin_results,
    admin_forms,
    admin_teams,
    admin_venues,
    admin_announcements,
    admin_settings,
    admin_audit,
    admin_archives,
    admin_leadership,
)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ensure database schema is created and default sports meet seeds exist."""
    seed_database()
    yield

app = FastAPI(
    title="SBU UMANG — Smart Sports Meet Management & Live Dashboard",
    description="Centralized sports tournament platform for Sarala Birla University, Ranchi. Live scores, inter-house leaderboard, match fixtures, and results.",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS Configuration
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5175,http://127.0.0.1:5175,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Add institutional security headers to prevent clickjacking and MIME sniffing."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# Include Routers
app.include_router(auth.router)
app.include_router(public.router)
app.include_router(admin_sports.router)
app.include_router(admin_events.router)
app.include_router(admin_results.router)
app.include_router(admin_forms.router)
app.include_router(admin_teams.router)
app.include_router(admin_venues.router)
app.include_router(admin_announcements.router)
app.include_router(admin_settings.router)
app.include_router(admin_audit.router)
app.include_router(admin_archives.router)
app.include_router(admin_leadership.router)


@app.get("/")
@app.get("/api")
@app.get("/api/")
def root():
    return {
        "institution": "Sarala Birla University, Ranchi",
        "service": "SBU UMANG Sports Meet Management & Live Dashboard API",
        "canonical_timezone": "Asia/Kolkata (IST)",
        "docs": "/api/docs",
        "public_portal": "/api/sports"
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "SBU UMANG Sports Meet API"}

