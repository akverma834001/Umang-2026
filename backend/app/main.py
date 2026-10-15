import os
import sys
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
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


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "SBU UMANG Sports Meet API"}


# --- Static Frontend Serving & Single Link Support ---
_dist_dir = os.path.abspath(os.path.join(_root_dir, "frontend", "dist"))
if not os.path.exists(_dist_dir):
    _dist_dir = os.path.abspath(os.path.join(_root_dir, "dist"))

if os.path.exists(_dist_dir):
    _assets_dir = os.path.join(_dist_dir, "assets")
    if os.path.exists(_assets_dir):
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="assets")

    @app.get("/")
    async def serve_root():
        index_path = os.path.join(_dist_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {
            "institution": "Sarala Birla University, Ranchi",
            "service": "SBU UMANG Sports Meet Management & Live Dashboard API",
            "docs": "/api/docs",
            "public_portal": "/api/sports"
        }

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not intercept API routes, Swagger docs, or health endpoint
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path == "health":
            raise HTTPException(status_code=404, detail="Not found")

        # Check for static file in dist directory (e.g., logos, icons)
        candidate_file = os.path.join(_dist_dir, full_path)
        if os.path.isfile(candidate_file):
            return FileResponse(candidate_file)

        # Fallback to index.html for client-side routing (/admin/login, /schedule, etc.)
        index_path = os.path.join(_dist_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Not found")
else:
    @app.get("/")
    def root():
        return {
            "institution": "Sarala Birla University, Ranchi",
            "service": "SBU UMANG Sports Meet Management & Live Dashboard API",
            "canonical_timezone": "Asia/Kolkata (IST)",
            "docs": "/api/docs",
            "public_portal": "/api/sports"
        }

