# StreetPulse

> StreetPulse closes the gap between reporting civic damage and verifying its repair.

StreetPulse is a Bengaluru-focused civic maintenance prototype for citizens, municipal teams and administrators. It combines location-based report grouping, accountable assignments, Cloudinary-hosted evidence and Cloudinary AI Vision comparison, while preserving administrator review and citizen confirmation.

The problem is not just collecting complaints: residents need to know who owns the work, what changed and whether the repair is supported by evidence. StreetPulse keeps those steps in one shared incident timeline. Its intended impact is less repeated reporting, clearer responsibility and more visible repair outcomes; these benefits have not yet been measured in a municipal deployment.

Modular monolith: **React + Vite + TypeScript + Tailwind** frontend, **FastAPI + SQLAlchemy** backend, **Cloudinary** media, vision-AI for analysis and repair verification.

## What to evaluate

- **Citizen reporting:** automatic coordinates with browser permission, map correction and place search; AI suggestions can be confirmed or corrected before submission.
- **Duplicate grouping:** unresolved reports of the same issue type within the configured radius join an incident rather than creating a separate work item for every report. This is proximity-based, not blanket grouping of an entire street.
- **Accountable work:** administrators assign a department, municipal member and due date, with explained priority and manual overrides.
- **Evidence-led completion:** municipal members start work, add notes and before/during/after evidence, then trigger repair comparison with a visible waiting state.
- **Human oversight:** unavailable or uncertain comparison goes to admin review. Failed repair evidence can be reopened; successful AI verification still requires citizen confirmation for the normal resolution flow. Administrators can override through review and can reopen verified work.
- **Longer-term visibility:** street history, recurring-issue indicators and admin analytics help reviewers inspect repeated problems, not just individual closures.

## Cloudinary integration evidence

| Capability | How it is used | Implementation |
| --- | --- | --- |
| Media storage and delivery | Uploads evidence and organises assets under incident folders | [Cloudinary media service](backend/app/services/cloudinary_service.py) |
| Image and video thumbnails | Delivers compact previews and image thumbnails for video evidence | [Thumbnail transformations](backend/app/services/cloudinary_service.py) |
| Report classification | AI Vision General mode suggests issue type, severity and description from the uploaded image | [AI service](backend/app/services/ai_service.py), [analysis route](backend/app/routers/verification.py) |
| Before/after composition | Creates a padded side-by-side image with before on the left and after on the right | [Repair comparison](backend/app/services/ai_service.py) |
| Repair verification | AI Vision checks comparability, improvement and remaining damage; application rules route the result | [Verification rules](backend/app/services/verification_service.py) |
| Failure handling | Invalid output, missing credentials and provider errors cannot produce an automatic verified repair | [Focused regression tests](backend/tests/test_cloudinary_analysis.py) |

Both classification and repair comparison use Cloudinary AI Vision. No separate OpenAI API key is required. To inspect a live integration, upload a permitted image, find its asset in Cloudinary Media Library and inspect AI Vision add-on usage. Credentials and add-on access belong on the backend, never in the browser or repository.

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

Seeded incidents illustrate timelines, assignments, recurrence and verification states. They are fictional demonstration records, not proof that a real municipality performed or verified those repairs. Use a fresh report to exercise live AI calls.

## Reproduce the complete workflow

Use separate browser profiles or different browsers for the three roles: ordinary tabs share the application's login token.

1. **Citizen:** open Report an Issue, allow location access or select/search a location, upload a road-damage image, then confirm or correct the classification and submit. Note the incident code.
2. **Admin:** open that incident, inspect evidence and priority, assign a municipal member and set a due date.
3. **Municipal:** open the assignment and click **Start Work**. Accept alone leaves it Assigned. Add notes and upload evidence with the appropriate Before/During/After stage.
4. **Negative case:** submit insufficient repair evidence as After and click **Mark Completed**. Inspect the actual comparison result; remaining damage, low confidence or incomparable evidence leads to review. The administrator can reopen the work even if AI incorrectly accepts the evidence.
5. **Positive case:** after reopening, upload convincing repair evidence from the same location and complete again. A sufficiently confident, comparable improvement without remaining damage becomes Verified and awaits citizen confirmation.
6. **Citizen:** inspect the before/after evidence and confirm to resolve, or dispute to send it to admin review. Inspect the preserved timeline and street history.

AI outcomes are not guaranteed. Never label a manual admin approval as an AI success. A location permission failure can be handled through manual map selection; classification failures permit manual classification. A failed comparison requires human review rather than simulated success.

## Validation

Run the focused backend suite from `backend`:

```powershell
.\.venv\Scripts\python -m unittest discover -s tests -v
```

Run the frontend typecheck and production build from `frontend`:

```powershell
npm run build
```

The regression suite covers Cloudinary request construction, response validation, provider failures, missing credentials, video thumbnails, incomparable evidence, review escalation and citizen confirmation. Provider calls in unit tests are mocked; a live Cloudinary check additionally requires enabled credentials, add-on quota and publicly accessible images. Passing tests are not a measure of model accuracy.

## Configuration (`.env`)

- `DATABASE_URL` - PostgreSQL URL for production; defaults to local SQLite for development.
- `CLOUDINARY_*` - if unset, media is stored in `backend/uploads` for local development. AI services and online map tiles still require network access.
- Report classification uses Cloudinary AI Vision General mode. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`, activate the AI Vision add-on in the Cloudinary console, and check its token quota/pricing. These credentials stay on the backend.
- Upload an image (or a video with a Cloudinary image thumbnail), then request analysis. The backend submits its public HTTPS URL to AI Vision and validates the response before returning a suggestion for citizen confirmation. Model-reported confidence is not a calibrated probability.
- Failed analysis returns a clear error and permits manual classification; there is no simulated classification or fallback to another AI provider. Local-only uploads cannot be remotely analyzed.
- Repair verification also uses Cloudinary AI Vision; no separate `AI_API_KEY` is needed. Cloudinary creates a padded comparison image with BEFORE on the left and AFTER on the right, preserving each photo's aspect ratio. Video evidence uses its thumbnail. Public HTTPS images and permission for Cloudinary fetched-image transformations are required. Missing images, unavailable AI, low confidence or incomparable scenes require admin review. A successful comparison still requires citizen confirmation. Existing saved results are not automatically rerun; an administrator can reopen the repair so the municipal team can submit evidence and mark it completed again.
- `GROUPING_RADIUS_METERS` (default 50) - radius for grouping reports into one incident.

Never commit `.env`.

Run focused backend tests from `backend` with `python -m unittest discover -s tests -v`.
For a live check, upload a permitted road image, confirm that analysis displays "Cloudinary AI Vision suggestion", then confirm or correct it before submitting. Add-on access and quota are account-side prerequisites.

## Design notes

- SQLAlchemy stores structured data in SQLite by default, with PostgreSQL configurable; Cloudinary stores uploaded media when enabled.
- Incident grouping: same issue type, unresolved, within the radius.
- Priority is rule-based and explained: severity 40, report count 20, damage progression 15, age 15, traffic 10.
- AI is decision support. Municipal staff upload repair evidence and click Mark Completed to compare before/after photos. Failed, inconclusive or unavailable analysis, or citizen "No", sends the incident to admin review. Admin can reopen work or approve resolution; AI VERIFIED plus citizen "Yes" resolves it.
- Street condition (`/street/{id}`) is a prototype indicator derived from open incident severity, not a road-quality score.

## Scope and limitations

- This is a prototype, not an official municipal service or an emergency-reporting channel. No nationwide deployment, municipal partnership or measured repair-time reduction is claimed.
- Seeded photos and before/after pairs illustrate the interface; they are not independently verified repair evidence. Use genuine, same-location photos for a meaningful live comparison and label staged demonstrations clearly.
- AI confidence is self-reported, not calibrated accuracy or proof of repair. Camera angle, image quality and scene differences can affect results. Video verification uses a thumbnail, not full-video analysis.
- Cloudinary availability, fetched-image transformation permissions and AI Vision add-on quota affect live comparisons. Old saved verification records do not automatically rerun after configuration changes.
- The published accounts and development defaults are for local evaluation only. Replace demo credentials and development secrets, and review privacy, access controls and deployment security before public production use. Never commit `.env` or real credentials.

## Layout

```
backend/app   models, schemas, routers, services (cloudinary, ai, incident, priority, verification, timeline)
frontend/src  components, pages/{citizen,municipal,admin}, services/api.ts
docs/         copilot-context.md
```
