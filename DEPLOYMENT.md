# Sarala Birla University (SBU) Event Management Platform
## Production Deployment & Operational Architecture Guide

This document specifies the deployment architecture, PostgreSQL database backup/recovery strategies, canonical timezone policies, and environment configuration for production at **Sarala Birla University, Ranchi**.

---

## 1. System Architecture

```
[Public Students / Visitors (Strictly Read-Only)]
                  │
                  ▼ HTTPS
       [Vite React Frontend]
                  │
                  ▼ /api proxy or CORS
       [FastAPI Backend Engine]
        ├── JWT & Auth Rate Limiting Guard
        ├── Schedule Conflict Detection Engine
        ├── Transactional Point Ledger Recalculation
        └── Google Form URL Security Validator
                  │
                  ▼ (SQLAlchemy 2.0 Pool)
       [PostgreSQL Database (Neon / Supabase / Self-Hosted)]
        ├── admins
        ├── events
        ├── venues
        ├── teams
        ├── results
        ├── point_ledgers
        ├── registration_forms
        ├── announcements
        ├── website_settings
        └── audit_logs
```

---

## 2. Canonical Timezone Enforcement (IST)

Sarala Birla University is located in **Ranchi, Jharkhand (UTC+05:30)**.
- Canonical timezone is hard-locked to `Asia/Kolkata`.
- All event date/times, Google Form opening and closing deadlines, and audit logs are stored and formatted in IST.
- Client browsers across all timezones receive explicit IST representations to prevent scheduling drift.

---

## 3. Database Strategy & PostgreSQL Backup / Recovery

### Primary Database: PostgreSQL
The application is built on SQLAlchemy 2.0 and supports PostgreSQL out of the box via connection string:
```bash
DATABASE_URL=postgresql+psycopg2://postgres:[PASSWORD]@[HOST]:5432/[DB_NAME]?sslmode=require
```

### Automated Backup Strategy
To ensure zero data loss during high-stakes inter-house festivals:

1. **Automated Daily Backups (`pg_dump`)**:
   ```bash
   # Daily compressed backup script (cron or scheduled task)
   pg_dump --format=custom --no-owner --no-privileges \
     --file="/backups/sbu_events_$(date +\%Y\%m\%d_\%H\%M\%S).dump" \
     "$DATABASE_URL"
   ```

2. **Point-In-Time Recovery (PITR)**:
   - When deploying to **Supabase** or **Neon**, enable 7-day or 30-day WAL Point-In-Time-Recovery from the cloud console.
   - For self-hosted PostgreSQL, enable `wal_level = replica` and archive WAL segments to S3 or an off-site server.

3. **Disaster Recovery Restoration**:
   ```bash
   # Restore clean database from dump
   pg_restore --clean --if-exists --no-owner --no-privileges \
     --dbname="$DATABASE_URL" \
     /backups/sbu_events_YYYYMMDD.dump
   ```

---

## 4. Production Environment Variables (`.env`)

| Variable | Description | Production Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection URI | `postgresql+psycopg2://...` |
| `SECRET_KEY` | High-entropy cryptographic JWT secret | `Generate via: openssl rand -hex 32` |
| `ALGORITHM` | Token signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Admin session duration | `480` (8 Hours) |
| `ADMIN_USERNAME` | Master administrator username | `admin` |
| `ADMIN_PASSWORD` | Strong administrative password | `StrongPassword@2026#SBU` |
| `CANONICAL_TIMEZONE` | Canonical timezone identifier | `Asia/Kolkata` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `https://events.sbu.ac.in` |
| `ENVIRONMENT` | Deployment environment | `production` |

---

## 5. Deployment Commands

### Frontend & Serverless Full-Stack Deployment on Vercel:

The platform is pre-configured for seamless zero-config deployment on **Vercel** with two supported models:

#### Mode A: Full-Stack Unified Vercel Deployment (Recommended)
Both the React Vite frontend and FastAPI backend are deployed together on Vercel:
1. Push your code to a GitHub/GitLab repository.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New > Project** and import the repository.
3. Keep **Root Directory** as `./` (default).
4. Vercel automatically detects [`vercel.json`](file:///c:/Users/abhis/Desktop/UMANG/Application/12.9/vercel.json) and [`package.json`](file:///c:/Users/abhis/Desktop/UMANG/Application/12.9/package.json):
   - **Build Command**: `npm --prefix frontend install && npm --prefix frontend run build`
   - **Output Directory**: `frontend/dist`
   - **Backend API**: The ASGI entrypoint [`api/index.py`](file:///c:/Users/abhis/Desktop/UMANG/Application/12.9/api/index.py) automatically serves FastAPI at `/api/*` via Vercel's Python Serverless Runtime.
   - **SPA Routing**: Non-API routes are rewritten to `/index.html` so client-side routes (`/admin/login`, `/schedule`, `/sports`, etc.) refresh cleanly without 404 errors.
5. In **Project Settings > Environment Variables**, add:
   - `DATABASE_URL`: `postgresql+psycopg2://[USER]:[PASSWORD]@[HOST]:5432/[DB]?sslmode=require` (e.g., from Neon or Supabase)
   - `SECRET_KEY`: High-entropy 32-character random string (e.g., `openssl rand -hex 32`)
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: Your chosen secure administrator password
   - `CANONICAL_TIMEZONE`: `Asia/Kolkata`
6. Click **Deploy**.

#### Mode B: Decoupled Frontend-Only Deployment
If you prefer running FastAPI on an external server (e.g. Render, Railway, AWS EC2, or Cloud Run):
1. In Vercel, set **Root Directory** to `frontend`.
2. The [`frontend/vercel.json`](file:///c:/Users/abhis/Desktop/UMANG/Application/12.9/frontend/vercel.json) file automatically handles SPA route fallbacks to `/index.html`.
3. Add the following environment variable in Vercel:
   - `VITE_API_URL`: URL of your deployed backend (e.g., `https://sbu-umang-api.onrender.com`).
4. Click **Deploy**.

### Traditional Backend Deployment (Docker / Linux VM / Cloud Run):
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 6. SBU Brand Configuration & White-Label Customization

To rebrand the platform or modify university visual tokens without code changes:
1. Authenticate at `/admin/login`.
2. Navigate to **Settings & Branding**.
3. Modify:
   - University Full Name, Short Name, Location, Address.
   - Primary Color (SBU Crimson `#800000`), Secondary Navy (`#1B2A4A`), Accent Gold (`#D4AF37`).
   - Fest Name, Tagline, Dates, Hero Background Image.
   - Social Media Links & Footer Legal Statements.
4. Click **Save & Publish Branding Changes**. The CSS variables and metadata update across the entire portal immediately.
