# Sarala Birla University (SBU), Ranchi
## Smart Event & Competition Management Platform

Official centralized digital platform for **Sarala Birla University (SBU), Ranchi** to manage university fests, inter-house competitions, live matches, schedules, results, external Google Forms registrations, and immutable points ledgers.

---

## 🌟 Core Product Features

### 1. Dual-Interface Architecture
* **Public Portal (Read-Only)**: Zero student login required. Students, visitors, and faculty can view competitions, dynamic schedules, live match updates, inter-house leaderboards, verified results, university announcements, campus venues, and open Google Form registration links.
* **Administrative Control Center**: Secured behind rate-limited cryptographic authentication. Full CRUD control over events, schedules, results, house scoring, Google Forms, and platform branding.

### 2. Immutable Points Ledger
* Inter-house standings are calculated dynamically from validated event results written to an immutable `point_ledgers` database table.
* Eliminates arbitrary double counting.
* Full point breakdown transparency for public attendees.

### 3. Schedule Conflict Prevention
* Real-time venue and time-slot overlap engine checks for conflicts during event creation and timetable scheduling.
* Overlapping sessions at the same venue on the same date are detected and blocked before publishing.

### 4. External Google Forms Integration
* Zero internal participant database or accounts.
* All competition registrations link out safely to verified HTTPS Google Forms (`forms.gle`, `docs.google.com/forms`) with `rel="noopener noreferrer"`.

### 5. Canonical IST Timezone
* All dates, match schedules, registration opening/closing times, and audit logs are recorded and displayed in **Asia/Kolkata (IST, UTC+05:30)** to prevent browser timezone drift.

### 6. Dynamic SBU Theming
* Centralized `WebsiteSettings` database model enables administrative customization of university identity, hero graphics, and CSS variables (`--brand-primary`, `--brand-secondary`, `--brand-accent`).

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Recharts, React Router v6.
* **Backend**: Python 3, FastAPI, SQLAlchemy 2.0, Pydantic v2.
* **Database**: PostgreSQL (Supabase / Neon supported; SQLite development fallback for instant zero-dependency testing).
* **Security**: Salted PBKDF2-HMAC-SHA256 password hashing, signed cryptographic tokens, login rate limiting, optimistic locking (`version` column).

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Startup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated integration tests (all 30 flows)
python -m pytest tests/test_all_flows.py -v

# Launch the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be accessible at: `http://127.0.0.1:8000/api/docs`

### 2. Frontend Setup & Startup
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Build for production
npm run build

# Start local development server
npm run dev
```
The Public Portal will be accessible at: `http://localhost:5173`

---

## 🔐 Default Administrator Credentials
- **Username**: `admin`
- **Password**: `admin@SBU2026`
- **Admin Login Route**: `/admin/login`
- **Audit Logs Route**: `/admin/audit`
