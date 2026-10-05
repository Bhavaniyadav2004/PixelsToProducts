# StreetPulse

> StreetPulse closes the gap between reporting civic damage and verifying its repair.

## Live demo

| Resource | Link |
| --- | --- |
| Live application | [Open StreetPulse](https://streetpulse-alpha.vercel.app) |
| Demo access | [Sign in](https://streetpulse-alpha.vercel.app/login) |
| Video walkthrough | [Watch the project explanation and demo](https://youtu.be/pGMUPEqazt8?si=0twcrinIhyH2Dn6D) |

No local setup or Vercel account is required.

### Demo login

1. Open the login page.
2. Click **Citizen**, **Municipal** or **Admin** to auto-fill that role's credentials.
3. Click **Sign in**.

You can also enter the credentials below manually.

**New citizen account:** click **New here? Create an account**. Public registration creates citizen accounts only.

**Municipal and admin access:** use the existing accounts below. These roles cannot be created through public registration.

| Role | Email | Password |
| --- | --- | --- |
| Citizen | citizen@streetpulse.test | citizen123 |
| Municipal | ravi@streetpulse.test | municipal123 |
| Admin | admin@streetpulse.test | admin123 |

This is a public evaluation sandbox: use fictional data and permitted images only, never personal or sensitive information.

### Hosted demo notes

- **Hosting:** Vercel frontend and FastAPI, persistent Neon PostgreSQL, and Cloudinary media storage. [Check API health](https://streetpulse-api.vercel.app/api/health).
- **Verified on October 5, 2026:** public access, all three role logins, and citizen dashboard loading. A fresh live AI repair workflow was not re-tested during deployment.
- **Uploads:** keep files below 4 MB because Vercel's request body limit is lower than the application's local upload limit.

## Try the deployed application

### Prepare for the demo

Open [StreetPulse login](https://streetpulse-alpha.vercel.app/login), select a demo role and click **Sign in**. No installation is needed. Switch roles using **Sign out**, then return to the login page. For simultaneous sessions, use separate browser profiles or different browsers; ordinary tabs share the same login.

For a new report, prepare a permitted road-damage image below 4 MB. To test repair comparison, also prepare a genuine after-repair photo of the same location from a similar angle. Use fictional descriptions and avoid personal information. Demo accounts and records are shared, so other reviewers may change their state.

### Quick tour without changing records

1. **Citizen:** open **My reports**, select a report, and inspect its status, photos and timeline. Explore **Nearby issues** to see the map-based view.
2. **Municipal:** sign in with the municipal demo account and open an assigned work item to inspect its location, evidence and progress.
3. **Admin:** sign in with the admin demo account and inspect the incident list, assignments, verification queue and analytics.

This tour uses seeded examples. It demonstrates the interface, not a fresh AI analysis or an independently verified repair.

### Test one issue from report to review

| Step | Role and action | What to check |
| --- | --- | --- |
| 1. Report damage | **Citizen:** choose **Report an issue**, select or search for a location (or allow browser location), and upload the damage image. Review the AI suggestion, confirm or correct the details, and submit. If analysis is unavailable, use manual classification. | A submission confirmation appears. Open **View Timeline** and note the incident code. The report may join an existing nearby incident instead of creating a new one. |
| 2. Assign responsibility | **Admin:** find that incident code in the incident list. Open it and assign a department, the municipal demo user **Ravi Gowda**, and a due date. | The incident shows its owner and assignment in the timeline. Assigning another worker will not put it in Ravi's work queue. |
| 3. Record the work | **Municipal:** open the assigned incident, click **Start Work**, add a progress note, and upload repair evidence with the appropriate Before/During/After stage. | The status moves to In Progress and the evidence is attached to the incident. **Accept** alone does not start work. |
| 4. Request verification | **Municipal:** with after-repair evidence attached, click **Mark Completed** and wait for the comparison result. | Inspect the before/after evidence and result. Clear, comparable improvement can proceed to citizen confirmation; missing, uncertain or failed evidence requires admin review. |
| 5. Confirm or challenge | **Citizen:** return to the account that submitted the report, open **My reports**, and select the same issue. When the repair confirmation prompt is available, choose **YES - Looks Fixed** or **NO - Still Damaged** based on the evidence. | In the normal successful AI path, agreement resolves the incident. Disagreement sends it to review. The prompt is not available for every status. |
| 6. Inspect the review path | **Admin:** if the issue requires review, open it through the verification queue, inspect the evidence and reason, then reopen the work or use the available manual resolution action as appropriate. | The timeline retains the decision. A manual admin resolution is not an AI verification success. |

**If you do not have a valid before/after pair:** test reporting, assignment and progress, then inspect the review outcome rather than expecting an automatic successful verification. Cloudinary availability, quota and image comparability affect results. Refresh the incident after switching roles to see its latest state.

For a more detailed test, including negative and positive evidence cases, see [Reproduce the complete workflow](#reproduce-the-complete-workflow).

## Project overview

**StreetPulse turns a civic complaint into an accountable repair workflow, from the first photograph to citizen confirmation.**

Built around Bengaluru's streets, the prototype brings citizens, municipal teams and administrators into one shared incident timeline. A resident reports damage with location and visual evidence. Related reports can join an existing incident. An administrator assigns responsibility, a municipal worker records the repair, and Cloudinary AI Vision compares before-and-after evidence. Human review and citizen confirmation remain part of the decision to close the issue.

The central question is not just **"Was this reported?"** It is **"Who owns it, what changed, and is there evidence that the repair worked?"**

### The problem it addresses

A reporting form captures a complaint, but does not by itself establish responsibility or demonstrate a repair. Repeated reports can fragment the same issue across separate records. A completion status alone does not show whether the location matches, whether damage remains, or whether the resident agrees with the outcome.

StreetPulse addresses these gaps through a connected workflow:

| Gap | StreetPulse response | Practical value |
| --- | --- | --- |
| Multiple people report the same nearby damage | Groups unresolved reports of the same issue type within a configurable radius | Keeps related evidence and report counts attached to a shared work item |
| Residents cannot see who is responsible | Department and worker assignment, due dates, status changes and a timeline | Makes ownership and progress visible |
| Work needs an understandable order | Rule-based priority with contributing factors and admin overrides | Supports explainable triage instead of an unexplained score |
| A completion claim lacks supporting evidence | Before/during/after media and AI-assisted repair comparison | Gives reviewers evidence to inspect before accepting completion |
| AI is uncertain or the resident disagrees | Admin review, reopening, dispute handling and citizen confirmation | Preserves a route to challenge an incorrect outcome |
| Recurring damage is hard to follow | Street history and recurring-issue indicators | Helps reviewers investigate repeated problems over time |

### One workflow, three roles

- **Citizens** report issues, inspect progress and evidence, and confirm or dispute the repair.
- **Municipal teams** receive assigned work, record progress, and submit repair evidence.
- **Administrators** prioritize and assign incidents, review uncertain outcomes, and reopen or resolve work with oversight.

The normal completion path is **report -> group and prioritize -> assign -> repair -> compare evidence -> citizen confirmation**. Failed or uncertain comparison takes a review path rather than being presented as a successful repair.

## Why StreetPulse stands out

**The strongest case for StreetPulse is the combination of a useful civic workflow, meaningful visual AI integration, and explicit checks on automated decisions.** Its value is in connecting those pieces into an inspectable experience, not in claiming that AI alone can certify public infrastructure.

| Evaluation dimension | What makes the project a strong contender | Evidence to inspect |
| --- | --- | --- |
| Problem relevance | Connects reporting to ownership, repair evidence and resident feedback | [Complete three-role walkthrough](#reproduce-the-complete-workflow) |
| Product completeness | Implements citizen, municipal and admin workflows rather than stopping at an upload-and-predict screen | [Citizen pages](frontend/src/pages/citizen), [municipal pages](frontend/src/pages/municipal), [admin pages](frontend/src/pages/admin) |
| Cloudinary integration depth | Uses media delivery, video thumbnails, comparison-image composition and AI Vision at reporting and verification stages | [Cloudinary integration evidence](#cloudinary-integration-evidence) |
| Responsible AI design | Routes unavailable, incomparable or low-confidence evidence to review; successful AI verification still needs citizen confirmation in the normal flow | [Verification service](backend/app/services/verification_service.py) |
| Operational reasoning | Combines proximity-based grouping with explainable priority and assignment | [Incident service](backend/app/services/incident_service.py), [priority service](backend/app/services/priority_service.py) |
| Engineering evidence | Includes focused regression tests for provider failures, invalid output and verification decisions | [Backend regression tests](backend/tests/test_cloudinary_analysis.py) |
| Demonstrability | Provides a public deployment, three demo roles, seeded scenarios and a video walkthrough | [Live demo and video](#live-demo), [demo login](#demo-login) |

These are concrete strengths reviewers can verify in the application and source. They support an award case based on implementation and usefulness; they do not establish superiority over projects that have not been evaluated.

## Effectiveness and intended impact

StreetPulse is designed to improve **coordination, visibility and evidence quality**. Its current effectiveness can be assessed at the workflow level: can users follow an issue across roles, inspect the evidence behind its status, and challenge an unsupported repair claim?

| Intended benefit | Implemented mechanism | What a real-world pilot should measure |
| --- | --- | --- |
| Less fragmented handling of duplicate complaints | Shared incidents for nearby reports of the same issue type | Correct grouping rate, incorrect merges and separate work items avoided |
| Clearer responsibility and faster triage | Explained priorities, ownership and due dates | Time to assignment and overdue work, compared with a baseline |
| More defensible repair acceptance | Visual comparison, review escalation and citizen feedback | False acceptance/rejection rates against independent human inspection |
| Better resident visibility | Report status, incident timelines and repair evidence | Whether residents can identify the owner, current status and reason for closure |
| Better understanding of repeated damage | Street history and recurrence indicators | Repeat-issue identification quality and how that information changes maintenance decisions |

**Evidence boundary:** public access, all three role logins and citizen dashboard loading have been checked. The focused backend suite passed 15 tests during deployment preparation, and the frontend production build passed. Provider calls in the tests are mocked. No municipal pilot, measured repair-time reduction, cost saving or validated AI accuracy is claimed; those require field evaluation.

## Technical approach

StreetPulse uses a modular monolith with separate frontend and API deployments:

| Layer | Technology and responsibility |
| --- | --- |
| User interface | React, Vite, TypeScript and Tailwind for the three role-based workflows |
| API and workflow rules | FastAPI services for incidents, priorities, repairs, verification and timelines |
| Structured data | SQLAlchemy with SQLite for local development and PostgreSQL for the hosted demo |
| Media and visual analysis | Cloudinary storage, delivery, transformations and AI Vision |

Cloudinary handles visual evidence; application rules decide how its results affect the workflow. Keeping these responsibilities separate allows a provider error or uncertain model output to trigger review without pretending the repair has been verified.

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

### Backend

Local API: http://localhost:8000

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
copy ..\.env.example .env      # optional; all values have dev defaults
.\.venv\Scripts\python -m uvicorn app.main:app --reload
```

### Frontend

Local application: http://localhost:5173

```powershell
cd frontend
npm install
npm run dev
```

### Demo data

On first start with an empty database, demo data is seeded automatically (10 incidents, 30 reports, 40 media, 5 repair workflows). Use the accounts listed under [Demo login](#demo-login).

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

For a live check, upload a permitted road image, confirm that analysis displays "Cloudinary AI Vision suggestion", then confirm or correct it before submitting. Add-on access and quota are account-side prerequisites.

### Deployment and submitted source

The current repository preserves the submitted source from `a0772d4`; only this README differs. The running Vercel deployment includes hosting adaptations for PostgreSQL driver selection, temporary uploads and one-time database initialization. Those adaptations were reverted from the repository, not from the already-running deployment.

The hosted frontend and backend are separate Vercel projects. Frontend `VITE_API_URL` points to the API origin, and backend `CORS_ORIGINS` permits the frontend origin. Database, Cloudinary and JWT secrets stay in the backend environment. GitHub auto-deploy is not connected; deploying the restored source directly requires reapplying the hosting adaptations.

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
- The published accounts are shared evaluation accounts for the local and hosted demo, not private production accounts. Replace demo credentials and development secrets, and review privacy, access controls and deployment security before real production use. Never commit `.env` or real credentials.

## Layout

```
backend/app   models, schemas, routers, services (cloudinary, ai, incident, priority, verification, timeline)
frontend/src  components, pages/{citizen,municipal,admin}, services/api.ts
docs/         copilot-context.md
```
