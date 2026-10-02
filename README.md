# StreetPulse

> Every street has a visual memory. A complaint is a moment. A visual timeline is accountability.

Modular monolith: **React + Vite + TypeScript + Tailwind** frontend, **FastAPI + SQLAlchemy** backend, **Cloudinary** media, vision-AI for analysis and repair verification.

## Run locally

Backend (http://localhost:8000):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
copy ..\.env.example .env      # optional; all values have dev defaults
.\.venv\Scripts\python -m uvicorn app.main:app --reload
```

Frontend (http://localhost:5173):

```powershell
cd frontend
npm install
npm run dev
```

On first start with an empty database, demo data is seeded automatically (10 incidents, 30 reports, 40 media, 5 repair workflows).

| Role | Email | Password |
| --- | --- | --- |
| Citizen | citizen@streetpulse.test | citizen123 |
| Municipal | ravi@streetpulse.test | municipal123 |
| Admin | admin@streetpulse.test | admin123 |

The main demo incident is **SP-1001** (MG Road pothole): report, damage progression, assignment, repair, before/after, AI verification, citizen confirmation, resolved. SP-1006 is the recurrence at the same spot.

## Configuration (`.env`)

- `DATABASE_URL` - PostgreSQL URL for production; defaults to local SQLite for development.
- `CLOUDINARY_*` - if unset, media is stored in `backend/uploads` so the app still works offline.
- `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL` - any OpenAI-compatible vision API. If unset, a clearly labelled demo estimate is used.
- `GROUPING_RADIUS_METERS` (default 50) - radius for grouping reports into one incident.

Never commit `.env`.

## Design notes

- PostgreSQL holds structured data; Cloudinary holds media (only references are stored).
- Incident grouping: same issue type, unresolved, within the radius.
- Priority is rule-based and explained: severity 40, report count 20, damage progression 15, age 15, traffic 10.
- AI is decision support. Outcome logic: AI FAILED reopens the repair; citizen "No" or an inconclusive AI result sends the incident to admin review; AI VERIFIED plus citizen "Yes" resolves it.
- Street condition (`/street/{id}`) is a prototype indicator derived from open incident severity, not a road-quality score.

## Layout

```
backend/app   models, schemas, routers, services (cloudinary, ai, incident, priority, verification, timeline)
frontend/src  components, pages/{citizen,municipal,admin}, services/api.ts
docs/         copilot-context.md
```
