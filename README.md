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
- Report classification uses Cloudinary AI Vision General mode. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`, activate the AI Vision add-on in the Cloudinary console, and check its token quota/pricing. These credentials stay on the backend.
- Upload an image (or a video with a Cloudinary image thumbnail), then request analysis. The backend submits its public HTTPS URL to AI Vision and validates the response before returning a suggestion for citizen confirmation. Model-reported confidence is not a calibrated probability.
- Failed analysis returns a clear error and permits manual classification; there is no simulated classification or fallback to another AI provider. Local-only uploads cannot be remotely analyzed.
- Repair verification also uses Cloudinary AI Vision; no separate `AI_API_KEY` is needed. Cloudinary creates a padded comparison image with BEFORE on the left and AFTER on the right, preserving each photo's aspect ratio. Video evidence uses its thumbnail. Public HTTPS images and permission for Cloudinary fetched-image transformations are required. Missing images, unavailable AI, low confidence or incomparable scenes require admin review. A successful comparison still requires citizen confirmation. Existing saved results are not automatically rerun; an administrator can reopen the repair so the municipal team can submit evidence and mark it completed again.
- `GROUPING_RADIUS_METERS` (default 50) - radius for grouping reports into one incident.

Never commit `.env`.

Run focused backend tests from `backend` with `python -m unittest discover -s tests -v`.
For a live check, upload a permitted road image, confirm that analysis displays "Cloudinary AI Vision suggestion", then confirm or correct it before submitting. Add-on access and quota are account-side prerequisites.

## Design notes

- PostgreSQL holds structured data; Cloudinary holds media (only references are stored).
- Incident grouping: same issue type, unresolved, within the radius.
- Priority is rule-based and explained: severity 40, report count 20, damage progression 15, age 15, traffic 10.
- AI is decision support. Municipal staff upload repair evidence and click Mark Completed to compare before/after photos. Failed, inconclusive or unavailable analysis, or citizen "No", sends the incident to admin review. Admin can reopen work or approve resolution; AI VERIFIED plus citizen "Yes" resolves it.
- Street condition (`/street/{id}`) is a prototype indicator derived from open incident severity, not a road-quality score.

## Layout

```
backend/app   models, schemas, routers, services (cloudinary, ai, incident, priority, verification, timeline)
frontend/src  components, pages/{citizen,municipal,admin}, services/api.ts
docs/         copilot-context.md
```
