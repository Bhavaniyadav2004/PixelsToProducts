# StreetPulse — End-to-End Architecture & GitHub Copilot Build Plan

> **StreetPulse: Every street has a visual memory.**
>
> A complaint is a moment. A visual timeline is accountability.

---

# 1. Product Definition

## Problem

Today, the typical infrastructure complaint flow is:

```text
Citizen sees pothole
        ↓
Takes photo
        ↓
Submits complaint
        ↓
Complaint enters a ticketing system
        ↓
Citizen waits
        ↓
Repair may happen
        ↓
System says "Resolved"
```

The problem is that the system often loses the **visual context and lifecycle** of the problem.

It does not provide a strong visual answer to:

- What exactly was wrong?
- Where was it?
- Is this a duplicate complaint?
- How severe is it?
- Has the damage become worse?
- Who is responsible for fixing it?
- What is the repair status?
- Was it actually repaired?
- Does the road look better afterward?
- What happened to this location over time?

---

# 2. StreetPulse Solution

StreetPulse creates a persistent visual record for every infrastructure issue.

```text
CAPTURE
   ↓
UNDERSTAND
   ↓
LOCATE
   ↓
GROUP
   ↓
PRIORITIZE
   ↓
ASSIGN
   ↓
REPAIR
   ↓
PROVE
   ↓
VERIFY
   ↓
CITIZEN CONFIRMATION
   ↓
CLOSE
   ↓
VISUAL STREET HISTORY
```

The system turns citizen media into actionable infrastructure information.

---

# 3. Core Product Idea

Every issue becomes an **Incident**.

Every incident contains:

```text
Location
   +
Citizen Reports
   +
Photos / Videos
   +
AI Analysis
   +
Severity
   +
Priority
   +
Repair History
   +
Before/After Evidence
   +
Verification
   +
Citizen Feedback
```

Therefore, StreetPulse is not simply a pothole reporting application.

It is a:

> **Visual accountability platform for urban infrastructure.**

---

# 4. Three Separate User Experiences

The application must have three clearly separated experiences.

## A. Citizen Dashboard

Purpose:

> Report problems, track their progress, view evidence, and confirm whether repairs actually worked.

Citizen can:

- Report issue
- Upload photo/video
- Capture location
- See AI-detected issue
- Track report
- View incident timeline
- See duplicate/related reports
- Receive repair status
- View before/after evidence
- Confirm repair
- Reopen/report unresolved issue
- View nearby infrastructure issues

---

## B. Municipal Member Dashboard

Purpose:

> Work on assigned infrastructure issues and update repair progress.

A municipal member is a field/department user.

They can:

- View assigned incidents
- See issue location
- View citizen evidence
- View AI analysis
- See priority and reason
- Accept assignment
- Update work status
- Add work notes
- Upload repair evidence
- Mark repair completed
- Respond to verification feedback

They should NOT have the full administrative control of the platform.

---

## C. Admin Dashboard

Purpose:

> Manage the city's overall infrastructure workflow.

Admin can:

- View all incidents
- View city-wide map
- Filter incidents
- Manage priority
- Assign incidents to municipal members
- View department workload
- Monitor SLA/aging
- Review failed verification
- Review disputed repairs
- View analytics
- Manage users
- View recurring infrastructure problems
- View street health
- Close/reopen incidents

---

# 5. Complete End-to-End Workflow

## PHASE 1 — Citizen Detects a Problem

Citizen opens:

```text
StreetPulse
```

Clicks:

```text
+ Report an Issue
```

Selects:

```text
📸 Take Photo
🎥 Record Video
📁 Upload Media
```

The user can optionally add:

```text
Description:
"Large pothole near the junction"
```

Location is captured from the browser/device.

---

# 6. PHASE 2 — Media Goes to Cloudinary

The frontend sends the media to the backend.

```text
Citizen
   ↓
React Web App
   ↓
FastAPI
   ↓
Cloudinary
```

Cloudinary stores:

- Original image
- Original video
- Optimized versions
- Thumbnail
- Public ID
- Secure URL
- Media metadata

The backend stores only the Cloudinary references.

### Important architecture rule

```text
PostgreSQL
    = structured data

Cloudinary
    = media
```

Never store image/video binaries in PostgreSQL.

---

# 7. PHASE 3 — AI Understands the Media

The uploaded image is sent to a vision-capable AI model.

Example:

```json
{
  "issue_type": "POTHOLE",
  "severity": "HIGH",
  "confidence": 0.94,
  "description": "Large pothole affecting the road surface"
}
```

Supported MVP categories:

```text
POTHOLE
ROAD_CRACK
WATERLOGGING
BROKEN_FOOTPATH
DAMAGED_MANHOLE
DAMAGED_SIGN
BROKEN_STREETLIGHT
OTHER
```

Severity:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

The AI result is shown to the citizen:

```text
We detected:

Pothole
High severity

[ Confirm ]

[ Correct ]
```

The citizen can correct the classification.

---

# 8. PHASE 4 — Create or Find an Existing Incident

The backend checks whether the problem already exists.

It compares:

```text
Location
+
Issue type
+
Nearby reports
```

For the MVP, use a simple geographic radius.

Example:

```text
Same issue type
AND
within 50 meters
```

If an existing incident is found:

```text
New Report
    ↓
Existing Incident
```

If not:

```text
New Report
    ↓
New Incident
```

This prevents:

```text
50 citizens
   ↓
50 duplicate tickets
```

from becoming:

```text
50 reports
   ↓
1 infrastructure incident
```

---

# 9. PHASE 5 — Incident Created

Example:

```text
Incident ID:
SP-4821

Issue:
Pothole

Location:
XYZ Road

Severity:
HIGH

Reports:
7

Status:
NEW
```

The citizen gets:

```text
Report submitted successfully.

Incident:
SP-4821

Status:
NEW
```

---

# 10. PHASE 6 — Citizen Dashboard

Citizen opens:

```text
My Reports
```

Example:

```text
SP-4821
Pothole — XYZ Road

Reported:
02 Oct 2026

Severity:
HIGH

Status:
ASSIGNED

[ View Timeline ]
```

Citizen can see the complete lifecycle.

---

# 11. PHASE 7 — Admin Reviews the Incident

Admin dashboard contains:

```text
CITY OVERVIEW

Total Issues       184
Critical            12
High                47
In Progress         38
Awaiting Review      9
Resolved             78
```

Admin opens:

```text
SP-4821
```

Admin sees:

```text
Location
Issue
AI Analysis
Citizen Reports
Photos
Videos
Severity
Priority
Timeline
```

---

# 12. PHASE 8 — Priority Calculation

StreetPulse uses an explainable rule-based priority engine.

Example:

```text
Severity            40%
Number of reports   20%
Damage progression  15%
Age                 15%
Traffic importance  10%
```

Example result:

```text
Priority:
HIGH

Reasons:

✓ High severity
✓ 7 citizen reports
✓ Damage increasing
✓ Unresolved for 18 days
✓ Located on a high-traffic road
```

Do not use an unexplained "AI priority score."

The dashboard must explain why the issue is prioritized.

---

# 13. PHASE 9 — Admin Assigns the Issue

Admin selects:

```text
Assigned Department:
Road Maintenance

Municipal Member:
Ravi

Due Date:
05 Oct 2026

[ Assign ]
```

Status becomes:

```text
ASSIGNED
```

Municipal member receives the issue in their dashboard.

---

# 14. PHASE 10 — Municipal Member Dashboard

Municipal member logs in.

They see:

```text
MY WORK

Assigned:
12

In Progress:
5

Due Today:
2

Awaiting Verification:
3
```

Incident card:

```text
SP-4821

Pothole
HIGH PRIORITY

XYZ Road

7 citizen reports

[ Open Work Order ]
```

---

# 15. PHASE 11 — Field Investigation

Municipal member opens the work order.

They see:

```text
Citizen Evidence
AI Analysis
Location
Map
Historical Images
Priority Reasons
```

They can add:

```text
Work note:
"Inspection completed. Road damage confirmed."

[ Start Repair ]
```

Status:

```text
IN_PROGRESS
```

---

# 16. PHASE 12 — Repair Evidence

During/after repair, the municipal member uploads:

```text
Before
During
After
```

Example:

```text
Before:
Large pothole

During:
Road repair

After:
Repaired road surface
```

Media is uploaded to Cloudinary.

Cloudinary public IDs should follow:

```text
streetpulse/incidents/SP-4821/before
streetpulse/incidents/SP-4821/during
streetpulse/incidents/SP-4821/after
```

Status becomes:

```text
COMPLETED
```

---

# 17. PHASE 13 — Repair Evidence Validation

The system checks:

```text
Did the repair team upload evidence?
```

Minimum:

```text
After image
```

Preferred:

```text
Before + During + After
```

The issue moves to:

```text
AWAITING_VERIFICATION
```

---

# 18. PHASE 14 — AI Before/After Verification

AI receives:

```text
BEFORE IMAGE
+
AFTER IMAGE
```

It returns:

```json
{
  "improvement_detected": true,
  "remaining_damage": false,
  "confidence": 0.91,
  "summary": "The visible pothole appears repaired and the road surface is substantially improved."
}
```

Possible result:

```text
VERIFIED
```

or:

```text
REQUIRES_REVIEW
```

or:

```text
FAILED
```

AI is only decision support.

It should never be presented as unquestionable proof.

---

# 19. PHASE 15 — Citizen Verification

After repair, the citizen who reported the issue sees:

```text
This issue was marked as repaired.

Before / After

Does the road look repaired?

[ YES — Looks Fixed ]

[ NO — Still Damaged ]
```

---

# 20. PHASE 16 — Final Decision

## Case A — AI + Citizen Agree

```text
AI:
VERIFIED

Citizen:
YES

       ↓

INCIDENT CLOSED
```

---

## Case B — AI Says Verified, Citizen Says Not Fixed

```text
AI:
VERIFIED

Citizen:
NO

       ↓

REQUIRES_REVIEW
       ↓
Admin reviews
```

---

## Case C — AI Says Failed

```text
AI:
FAILED

       ↓

REPAIR REOPENED
       ↓
Municipal member notified
```

---

# 21. PHASE 17 — Incident Closed

Once verified:

```text
SP-4821

STATUS:
RESOLVED ✓

Resolution:
Road surface repaired

Verified:
02 Oct 2026
```

The incident remains permanently available as historical evidence.

---

# 22. PHASE 18 — Visual Timeline

Every incident has a timeline.

Example:

```text
12 AUG
📸
Small pothole

        ↓

28 AUG
📸
Pothole larger

        ↓

10 SEP
📸
Severe damage

        ↓

20 SEP
🚧
Repair started

        ↓

22 SEP
📸
Repair completed

        ↓

23 SEP
🔍
AI verification

        ↓

24 SEP
👤
Citizen confirmed

        ↓

24 SEP
✅
RESOLVED
```

This is the signature StreetPulse feature.

---

# 23. PHASE 19 — Street Visual History

Create a separate street page.

```text
/street/{street_id}
```

Example:

```text
XYZ ROAD

Current Condition:
GOOD

Total Issues:
21

Resolved:
18

Recurring:
2
```

Show all historical incidents on that street.

The user can visually see:

```text
BEFORE → DAMAGE → REPAIR → AFTER
```

This creates:

> **A visual memory of the street.**

---

# 24. PHASE 20 — Recurring Infrastructure Problems

StreetPulse identifies repeated incidents at approximately the same location.

Example:

```text
SP-100
Repair: January

SP-183
Repair: March

SP-291
Repair: June

SP-402
Repair: September
```

The system marks:

```text
⚠ RECURRING ISSUE
```

Admin can investigate the underlying problem.

Do not automatically claim a technical root cause.

Instead show:

```text
Possible recurring infrastructure problem.

4 incidents
4 repairs
9 months
```

---

# 25. CITIZEN DASHBOARD — Complete Specification

Route:

```text
/citizen
```

## Dashboard

```text
Hello, Citizen

My Reports       8
Open Issues      3
Resolved         5
```

## Nearby Issues

Map:

```text
🔴 Critical
🟠 High
🟡 Medium
🟢 Resolved
```

## My Reports

```text
SP-4821
Pothole
HIGH
ASSIGNED

SP-4920
Waterlogging
MEDIUM
RESOLVED
```

## Report Issue

```text
[ Take Photo ]
[ Upload Video ]

Location
Description

[ Submit ]
```

## Report Details

Show:

- Incident ID
- Issue
- Location
- Status
- Timeline
- Photos
- Repair evidence
- Verification
- Citizen feedback

---

# 26. MUNICIPAL MEMBER DASHBOARD — Complete Specification

Route:

```text
/municipal
```

## Dashboard

```text
My Assignments       12
In Progress           5
Due Today             2
Awaiting Verification 3
```

## Work Queue

Filters:

```text
Priority
Status
Due date
Issue type
```

## Work Order

Show:

```text
Incident
Location
Map
Citizen photos
AI analysis
Priority reasons
Historical timeline
```

Actions:

```text
[ Accept ]
[ Start Work ]
[ Add Note ]
[ Upload Evidence ]
[ Mark Completed ]
```

## Repair Upload

```text
Before
During
After

[ Upload Evidence ]
```

---

# 27. ADMIN DASHBOARD — Complete Specification

Route:

```text
/admin
```

## Overview

```text
TOTAL ISSUES             184

CRITICAL                  12
HIGH                      47
MEDIUM                    81
LOW                       44

IN PROGRESS               38
AWAITING VERIFICATION      9
RESOLVED                   78
```

## City Map

Display incident markers.

Click marker:

```text
SP-4821
Pothole
HIGH
ASSIGNED
```

## Priority Queue

```text
SP-4821  HIGH       92
SP-4812  HIGH       87
SP-4702  CRITICAL   85
```

## Assignment

Admin selects:

```text
Department
Municipal Member
Due Date
```

## Verification Queue

Show:

```text
Awaiting verification
Failed verification
Citizen disputes
```

## Analytics

Show:

- Issues by type
- Issues by severity
- Open vs resolved
- Average resolution time
- Verification success
- Recurring issues
- Department workload

---

# 28. Complete System Architecture

```text
                         ┌──────────────────────┐
                         │       CITIZEN        │
                         │                      │
                         │ Report / Track /     │
                         │ Verify               │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    CITIZEN WEB UI    │
                         └──────────┬───────────┘
                                    │
                                    │
┌──────────────────────┐            │
│ MUNICIPAL MEMBER     │            │
│                      │            │
│ Assigned Work        │            │
│ Repair Updates       │            │
│ Evidence Upload      │            │
└──────────┬───────────┘            │
           │                        │
           ▼                        ▼
┌──────────────────────┐   ┌──────────────────────┐
│ MUNICIPAL WEB UI     │   │      FASTAPI         │
└──────────┬───────────┘   │   MODULAR MONOLITH   │
           │               └──────────┬───────────┘
           │                          │
           └──────────────────────────┤
                                      │
                         ┌────────────┼─────────────┐
                         │            │             │
                         ▼            ▼             ▼
                  ┌────────────┐ ┌──────────┐ ┌────────────┐
                  │ Cloudinary │ │PostgreSQL│ │  Vision AI │
                  │            │ │          │ │            │
                  │ Photos     │ │ Users    │ │ Detection  │
                  │ Videos     │ │ Reports  │ │ Severity   │
                  │ Transform  │ │ Incidents│ │ Compare    │
                  │ Delivery   │ │ Repairs  │ │ Verify     │
                  └─────┬──────┘ │ Timeline │ └─────┬──────┘
                        │         └────┬─────┘       │
                        └──────────────┼─────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ STREETPULSE     │
                              │ CORE LOGIC      │
                              │                 │
                              │ Grouping        │
                              │ Priority        │
                              │ Assignment      │
                              │ Timeline        │
                              │ Verification    │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ ADMIN WEB UI    │
                              │                 │
                              │ City Dashboard  │
                              │ Map             │
                              │ Assignment      │
                              │ Analytics       │
                              │ Verification    │
                              └─────────────────┘
```

---

# 29. Simple Backend Architecture

Use a modular monolith.

```text
backend/
│
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── incident.py
│   │   ├── report.py
│   │   ├── media.py
│   │   ├── repair.py
│   │   └── verification.py
│   │
│   ├── schemas/
│   │
│   ├── routers/
│   │   ├── auth.py
│   │   ├── reports.py
│   │   ├── incidents.py
│   │   ├── media.py
│   │   ├── repairs.py
│   │   ├── verification.py
│   │   └── dashboards.py
│   │
│   ├── services/
│   │   ├── cloudinary_service.py
│   │   ├── ai_service.py
│   │   ├── incident_service.py
│   │   ├── priority_service.py
│   │   ├── verification_service.py
│   │   └── timeline_service.py
│   │
│   └── utils/
│
└── requirements.txt
```

---

# 30. Frontend Architecture

```text
frontend/
│
├── src/
│   │
│   ├── components/
│   │   ├── MediaUploader.tsx
│   │   ├── IncidentCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Timeline.tsx
│   │   ├── MapView.tsx
│   │   ├── BeforeAfter.tsx
│   │   └── PriorityBadge.tsx
│   │
│   ├── pages/
│   │   ├── Landing.tsx
│   │   │
│   │   ├── citizen/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ReportIssue.tsx
│   │   │   ├── MyReports.tsx
│   │   │   └── ReportDetails.tsx
│   │   │
│   │   ├── municipal/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── WorkQueue.tsx
│   │   │   └── WorkOrder.tsx
│   │   │
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── Incidents.tsx
│   │       ├── IncidentDetails.tsx
│   │       ├── VerificationQueue.tsx
│   │       └── Analytics.tsx
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── hooks/
│   ├── types/
│   └── utils/
│
└── package.json
```

---

# 31. Database Model

## User

```text
id
name
email
role
department_id
created_at
```

Roles:

```text
CITIZEN
MUNICIPAL_MEMBER
ADMIN
```

---

## Department

```text
id
name
description
```

Example:

```text
Road Maintenance
Drainage
Electrical
Public Works
```

---

## Incident

```text
id
incident_code
issue_type
severity
priority_score
priority_level
status
latitude
longitude
street_name
description
assigned_department_id
assigned_user_id
first_reported_at
last_reported_at
created_at
updated_at
```

---

## Report

```text
id
incident_id
user_id
description
latitude
longitude
created_at
```

---

## Media

```text
id
incident_id
report_id
uploaded_by
media_type
media_role
cloudinary_public_id
cloudinary_url
thumbnail_url
created_at
```

Media roles:

```text
CITIZEN_REPORT
REPAIR_BEFORE
REPAIR_DURING
REPAIR_AFTER
OTHER
```

---

## AIAnalysis

```text
id
media_id
issue_type
severity
confidence
description
raw_response
created_at
```

---

## RepairUpdate

```text
id
incident_id
updated_by
status
notes
created_at
```

---

## Verification

```text
id
incident_id
ai_result
ai_confidence
citizen_result
final_status
notes
created_at
```

---

# 32. API Architecture

## Authentication

```http
POST /api/auth/login
GET /api/auth/me
```

---

## Citizen

```http
POST /api/reports
GET /api/reports/my
GET /api/reports/{id}
POST /api/reports/{id}/citizen-verification
```

---

## Media

```http
POST /api/media/upload
DELETE /api/media/{id}
```

---

## Incidents

```http
GET /api/incidents
GET /api/incidents/{id}
PATCH /api/incidents/{id}
```

---

## Admin

```http
GET /api/admin/dashboard
GET /api/admin/incidents
POST /api/admin/incidents/{id}/assign
GET /api/admin/verification-queue
GET /api/admin/analytics
```

---

## Municipal

```http
GET /api/municipal/dashboard
GET /api/municipal/work-orders
GET /api/municipal/work-orders/{id}
PATCH /api/municipal/work-orders/{id}/status
POST /api/municipal/work-orders/{id}/media
```

---

## AI

```http
POST /api/ai/analyze/{media_id}
POST /api/ai/verify/{incident_id}
```

---

# 33. Cloudinary Architecture

Cloudinary is used for the entire media lifecycle.

## Upload

```text
Citizen
 ↓
FastAPI
 ↓
Cloudinary
```

## Store

```text
streetpulse/
    incidents/
        SP-4821/
            citizen/
            repair/
```

## Transform

Generate:

- Thumbnail
- Mobile-sized image
- Dashboard image
- Video preview
- Optimized delivery

## Deliver

Cloudinary URLs are used by:

- Citizen dashboard
- Municipal dashboard
- Admin dashboard
- Visual timeline
- Before/after comparison

## Metadata

Attach/search by:

```text
incident_code
issue_type
severity
street
media_role
status
```

---

# 34. Cloudinary's Role in the Pitch

Do NOT say:

> "We use Cloudinary to store images."

Say:

> **"Cloudinary powers the visual evidence lifecycle of StreetPulse—from citizen capture and video/image management to optimized delivery, historical timelines, repair evidence, and before/after verification."**

The media is not an accessory.

**Media is the product's evidence layer.**

---

# 35. Environment Variables

```env
DATABASE_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

AI_API_KEY=
AI_MODEL=

VITE_API_URL=http://localhost:8000
```

Never commit `.env`.

Commit:

```text
.env.example
```

---

# 36. Recommended Technology Stack

## Frontend

```text
React
Vite
TypeScript
Tailwind CSS
React Router
Axios
Leaflet
OpenStreetMap
Recharts
```

## Backend

```text
Python
FastAPI
Pydantic
SQLAlchemy
PostgreSQL
```

## Media

```text
Cloudinary
```

## AI

```text
Vision-capable AI API
```

Do not train a custom model for the hackathon.

---

# 37. Development Stages

Build the project in these stages.

```text
STAGE 1
Project foundation

        ↓

STAGE 2
Database + roles

        ↓

STAGE 3
Authentication

        ↓

STAGE 4
Cloudinary media

        ↓

STAGE 5
Citizen reporting

        ↓

STAGE 6
AI analysis

        ↓

STAGE 7
Incident grouping

        ↓

STAGE 8
Citizen dashboard

        ↓

STAGE 9
Admin dashboard

        ↓

STAGE 10
Municipal dashboard

        ↓

STAGE 11
Priority engine

        ↓

STAGE 12
Assignment workflow

        ↓

STAGE 13
Repair workflow

        ↓

STAGE 14
Repair evidence

        ↓

STAGE 15
AI verification

        ↓

STAGE 16
Citizen confirmation

        ↓

STAGE 17
Visual timeline

        ↓

STAGE 18
Street health

        ↓

STAGE 19
Analytics

        ↓

STAGE 20
Demo data + testing

        ↓

STAGE 21
UI polish + deployment
```

---

# 38. Stage 1 — Project Foundation

## Copilot prompt

```text
Read docs/copilot-context.md.

Create a simple StreetPulse monorepo.

Frontend:
- React
- Vite
- TypeScript
- Tailwind
- React Router
- Axios

Backend:
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL

Create:

frontend/
backend/
docs/

Create a clean modular monolith.

Do NOT create microservices.

Add:
.env.example
.gitignore
README.md

Only implement the project foundation.
```

---

# 39. Stage 2 — Database and Roles

## Copilot prompt

```text
Read docs/copilot-context.md.

Implement the StreetPulse database models.

Create:

User
Department
Incident
Report
Media
AIAnalysis
RepairUpdate
Verification

User roles:

CITIZEN
MUNICIPAL_MEMBER
ADMIN

Create SQLAlchemy relationships.

Create Pydantic schemas.

Do not implement business workflows yet.
```

---

# 40. Stage 3 — Authentication

## Goal

Simple role-based authentication.

After login:

```text
CITIZEN
    ↓
Citizen Dashboard

MUNICIPAL_MEMBER
    ↓
Municipal Dashboard

ADMIN
    ↓
Admin Dashboard
```

## Copilot prompt

```text
Read docs/copilot-context.md.

Implement simple JWT authentication for StreetPulse.

Support three roles:
CITIZEN
MUNICIPAL_MEMBER
ADMIN

Create:
POST /api/auth/login
GET /api/auth/me

Protect routes according to role.

Keep authentication simple and suitable for a hackathon.
Do not build enterprise SSO.
```

---

# 41. Stage 4 — Cloudinary

## Copilot prompt

```text
Read docs/copilot-context.md.

Implement Cloudinary media management.

Create cloudinary_service.py.

Support:
- image upload
- video upload
- thumbnail URL
- secure URL
- public ID

Create:
POST /api/media/upload

Store Cloudinary references in PostgreSQL.

Never expose CLOUDINARY_API_SECRET to the frontend.
```

---

# 42. Stage 5 — Citizen Reporting

## Copilot prompt

```text
Read docs/copilot-context.md.

Implement the complete citizen reporting flow.

Citizen can:
1. Open Report Issue.
2. Upload image/video.
3. Capture browser geolocation.
4. Add description.
5. Submit.

Create:
POST /api/reports
GET /api/reports/my
GET /api/reports/{id}

Connect the uploaded Cloudinary media to the report.

Build the React UI.
```

---

# 43. Stage 6 — AI Understanding

## Copilot prompt

```text
Read docs/copilot-context.md.

Implement AI media analysis.

Input:
Cloudinary media URL.

Output:
issue_type
severity
confidence
description

Supported issue types:
POTHOLE
ROAD_CRACK
WATERLOGGING
BROKEN_FOOTPATH
DAMAGED_MANHOLE
DAMAGED_SIGN
BROKEN_STREETLIGHT
OTHER

Validate the AI response using Pydantic.

Store AIAnalysis.

Show the result to the citizen before final confirmation.
```

---

# 44. Stage 7 — Incident Grouping

## Copilot prompt

```text
Read docs/copilot-context.md.

Implement incident creation/grouping.

When a report is submitted:
1. Search nearby incidents.
2. Compare issue type.
3. Use a configurable geographic radius.
4. If a matching incident exists, attach the report.
5. Otherwise create a new incident.

Use a simple explainable algorithm.

Do not implement complex computer vision similarity.
```

---

# 45. Stage 8 — Citizen Dashboard

## Copilot prompt

```text
Read docs/copilot-context.md.

Build the complete Citizen Dashboard.

Include:

Overview:
- My reports
- Open issues
- Resolved issues

Report Issue:
- photo/video upload
- location
- description

My Reports:
- incident ID
- issue
- severity
- status

Report Details:
- timeline
- citizen media
- repair evidence
- before/after
- verification
- citizen confirmation

Make it responsive and easy to use.
```

---

# 46. Stage 9 — Admin Dashboard

## Copilot prompt

```text
Read docs/copilot-context.md.

Build the Admin Dashboard.

Include:

1. City-wide summary
2. Total incidents
3. Critical incidents
4. High priority incidents
5. In-progress incidents
6. Awaiting verification
7. Resolved incidents
8. City map
9. Incident list
10. Filters
11. Priority queue
12. Assignment controls
13. Verification queue
14. Analytics

Admin can:
- assign incidents
- change priority
- review incidents
- review failed verification
- manage users

Do not expose municipal-member-only work actions here unless appropriate.
```

---

# 47. Stage 10 — Municipal Dashboard

## Copilot prompt

```text
Read docs/copilot-context.md.

Build the Municipal Member Dashboard.

Include:

Overview:
- assigned incidents
- in progress
- due today
- awaiting verification

Work Queue:
- filter by priority
- filter by status
- filter by due date

Work Order:
- location
- map
- citizen media
- AI analysis
- priority reasons
- historical timeline
- work notes

Actions:
- accept assignment
- start work
- add note
- upload before/during/after evidence
- mark completed

Municipal members can only access incidents assigned to them or their permitted department.
```

---

# 48. Stage 11 — Priority Engine

## Copilot prompt

```text
Read docs/copilot-context.md.

Implement an explainable priority engine.

Factors:
severity 40%
report count 20%
damage progression 15%
age 15%
traffic importance 10%

Return:
priority_score
priority_level
priority_reasons

Display the reasons in the Admin and Municipal dashboards.

Do not create an opaque AI score.
```

---

# 49. Stage 12 — Assignment Workflow

## Copilot prompt

```text
Read docs/copilot-context.md.

Implement admin assignment.

Admin selects:
- department
- municipal member
- due date

Status changes:

NEW
→ VERIFIED
→ ASSIGNED

Create assignment API and UI.

The municipal member should see the new work order immediately on their dashboard.
```

---

# 50. Stage 13 — Repair Workflow

## Copilot prompt

```text
Read docs/copilot-context.md.

Implement repair lifecycle.

Statuses:

NEW
VERIFIED
ASSIGNED
IN_PROGRESS
COMPLETED
AWAITING_VERIFICATION
VERIFIED
RESOLVED

Municipal member can:
- accept
- start
- update
- complete

Admin can:
- monitor
- reassign
- reopen
```

---

# 51. Stage 14 — Repair Evidence

## Copilot prompt

```text
Read docs/copilot-context.md.

Implement repair evidence upload.

Municipal member can upload:

REPAIR_BEFORE
REPAIR_DURING
REPAIR_AFTER

Store all media in Cloudinary.

Store Cloudinary references in Media table.

Create:
POST /api/municipal/work-orders/{id}/media

Display the evidence on the incident timeline.
```

---

# 52. Stage 15 — AI Verification

## Copilot prompt

```text
Read docs/copilot-context.md.

Implement AI repair verification.

Compare:
- repair before image
- repair after image

Return:
improvement_detected
remaining_damage
confidence
summary

Possible outcomes:
VERIFIED
REQUIRES_REVIEW
FAILED

AI must be decision support, not absolute proof.

Store the verification result.
```

---

# 53. Stage 16 — Citizen Confirmation

## Copilot prompt

```text
Read docs/copilot-context.md.

Implement citizen repair confirmation.

When repair is completed:

Show:
Before image
After image

Ask:
"Does the road look repaired?"

Buttons:
YES — Looks Fixed
NO — Still Damaged

If citizen says NO:
set incident to REQUIRES_REVIEW.

If AI says FAILED:
reopen the repair.

If AI and citizen agree:
allow the incident to become RESOLVED.
```

---

# 54. Stage 17 — Visual Timeline

## Copilot prompt

```text
Read docs/copilot-context.md.

Build the StreetPulse visual timeline.

Timeline must combine:
- citizen reports
- citizen media
- AI analysis
- assignment
- repair start
- repair evidence
- repair completion
- AI verification
- citizen confirmation
- final resolution

Use Cloudinary media throughout.

Make the timeline the most visually important component of the incident details page.
```

---

# 55. Stage 18 — Street Health

## Copilot prompt

```text
Read docs/copilot-context.md.

Build /street/{street_id}.

Show:
- current condition
- total incidents
- resolved incidents
- recurring incidents
- historical incidents
- visual media timeline

Show actual Cloudinary media.

Create a simple visual street history.

Do not invent a scientifically valid road-quality score.
If using a score, label it clearly as a prototype indicator and explain its inputs.
```

---

# 56. Stage 19 — Analytics

## Copilot prompt

```text
Read docs/copilot-context.md.

Build Admin Analytics.

Charts:
- incidents by issue type
- incidents by severity
- open vs resolved
- repair verification outcomes
- department workload
- recurring issues
- resolution time

Use Recharts.

Keep charts simple and useful.
```

---

# 57. Stage 20 — Demo Data

Create:

```text
10 incidents
30 citizen reports
40 media records
5 repair workflows
3 verified repairs
2 disputed repairs
2 recurring issues
```

At least one incident must contain:

```text
Original report
↓
Damage progression
↓
Assignment
↓
Repair
↓
Before/After
↓
AI verification
↓
Citizen confirmation
↓
Resolved
```

This is the main demo incident.

---

# 58. Stage 21 — Testing

## Citizen

```text
[ ] Login
[ ] Report issue
[ ] Upload image
[ ] Upload video
[ ] Location works
[ ] AI result appears
[ ] Submit report
[ ] View report
[ ] Track status
[ ] View timeline
[ ] Confirm repair
[ ] Dispute repair
```

## Municipal

```text
[ ] Login
[ ] Assigned work appears
[ ] View location
[ ] View citizen evidence
[ ] View AI result
[ ] Start repair
[ ] Add note
[ ] Upload before
[ ] Upload during
[ ] Upload after
[ ] Mark completed
```

## Admin

```text
[ ] Login
[ ] Dashboard loads
[ ] Map loads
[ ] Incident list works
[ ] Filters work
[ ] Priority works
[ ] Assignment works
[ ] Verification queue works
[ ] Analytics works
[ ] Reassign works
[ ] Reopen works
```

---

# 59. Stage 22 — UI Polish

Prioritize:

### Citizen

Simple, mobile-friendly reporting.

### Municipal

Fast operational workflow.

### Admin

Information-dense dashboard.

Use:

- Cards
- Status badges
- Map
- Timeline
- Before/after
- Large media
- Clear action buttons

Do not make every screen look identical.

Each role should have a purpose-specific dashboard.

---

# 60. Recommended Navigation

## Citizen

```text
StreetPulse
│
├── Home
├── Report Issue
├── My Reports
├── Nearby Issues
└── Profile
```

## Municipal Member

```text
StreetPulse
│
├── Dashboard
├── My Work
├── In Progress
├── Awaiting Verification
└── Profile
```

## Admin

```text
StreetPulse Admin
│
├── Overview
├── Map
├── Incidents
├── Priority Queue
├── Assignments
├── Verification
├── Analytics
├── Streets
└── Users
```

---

# 61. Complete Status Lifecycle

The incident status must represent the real-world process.

```text
NEW
 │
 ▼
AI_ANALYZED
 │
 ▼
VERIFIED
 │
 ▼
ASSIGNED
 │
 ▼
IN_PROGRESS
 │
 ▼
COMPLETED
 │
 ▼
AWAITING_VERIFICATION
 │
 ├───────────────┐
 │               │
 ▼               ▼
VERIFIED       FAILED
 │               │
 ▼               ▼
RESOLVED      REOPENED
                 │
                 ▼
             IN_PROGRESS
```

Citizen dispute:

```text
RESOLVED
   │
   ▼
CITIZEN_DISPUTED
   │
   ▼
REQUIRES_REVIEW
   │
   ├──→ RESOLVED
   │
   └──→ REOPENED
```

---

# 62. End-to-End Data Flow

```text
1. Citizen captures photo/video
             ↓
2. React receives media
             ↓
3. FastAPI receives media
             ↓
4. Cloudinary stores media
             ↓
5. Cloudinary returns secure URL
             ↓
6. PostgreSQL stores media reference
             ↓
7. AI analyzes image
             ↓
8. AI result stored
             ↓
9. System checks nearby incidents
             ↓
10. Existing incident found?
       /                 \
     YES                  NO
      ↓                    ↓
Attach report        Create incident
      \                    /
       └─────────┬────────┘
                 ↓
11. Priority calculated
                 ↓
12. Admin sees incident
                 ↓
13. Admin assigns municipal member
                 ↓
14. Municipal member sees work order
                 ↓
15. Field work begins
                 ↓
16. Repair evidence uploaded
                 ↓
17. Cloudinary stores evidence
                 ↓
18. Status = COMPLETED
                 ↓
19. AI compares before/after
                 ↓
20. Verification result
                 ↓
21. Citizen receives verification request
                 ↓
22. Citizen confirms/disputes
                 ↓
23. Admin reviews if required
                 ↓
24. Incident RESOLVED
                 ↓
25. Incident remains in visual history
                 ↓
26. Street Health updated
```

---

# 63. What Cloudinary Does in the End-to-End Process

```text
Citizen Capture
      ↓
Cloudinary Upload
      ↓
Media Management
      ↓
Image/Video Delivery
      ↓
AI Analysis Input
      ↓
Historical Media
      ↓
Repair Evidence
      ↓
Before/After Comparison
      ↓
Timeline
      ↓
Citizen Verification
      ↓
Permanent Visual Record
```

Cloudinary is therefore involved throughout the product's core loop.

---

# 64. Hackathon Demo Story

Use one incident for the complete demonstration.

## Scene 1 — Citizen

Show:

```text
Citizen sees pothole
```

Upload photo.

AI says:

```text
Pothole
High severity
```

Submit.

---

## Scene 2 — Citizen Dashboard

Show:

```text
SP-4821

Status:
NEW
```

---

## Scene 3 — Admin Dashboard

Admin sees:

```text
New High Priority Issue

7 reports
High severity
Damage increasing
```

Assigns it to:

```text
Road Maintenance
Ravi
```

---

## Scene 4 — Municipal Dashboard

Ravi sees:

```text
SP-4821

HIGH PRIORITY
```

Opens the map and evidence.

Changes:

```text
ASSIGNED
→
IN_PROGRESS
```

---

## Scene 5 — Repair

Upload:

```text
Before
During
After
```

Cloudinary stores and delivers the media.

Mark:

```text
COMPLETED
```

---

## Scene 6 — AI Verification

Show:

```text
BEFORE                 AFTER

🕳️                     🛣️
```

AI:

```text
Improvement detected
Remaining damage: Low
Confidence: 91%

REQUIRES CITIZEN CONFIRMATION
```

---

## Scene 7 — Citizen

Citizen receives:

```text
Was this issue fixed?

[ YES ]
[ NO ]
```

Clicks:

```text
YES
```

---

## Scene 8 — Resolution

Show:

```text
SP-4821

RESOLVED ✓

Repair verified
Citizen confirmed

Visual improvement recorded
```

---

## Scene 9 — Street Timeline

Open:

```text
XYZ Road
```

Show:

```text
JAN
Good

↓
MAR
Crack

↓
JUN
Pothole

↓
AUG
Severe

↓
SEP
Repair

↓
OCT
Verified
```

End with:

> **StreetPulse doesn't just collect complaints. It remembers what happened to the street and creates visual proof of improvement.**

---

# 65. MVP Priority

If time is limited, build these first:

## Tier 1 — Must Work

```text
1. Citizen Dashboard
2. Municipal Dashboard
3. Admin Dashboard
4. Photo upload
5. Cloudinary
6. AI issue detection
7. Location
8. Incident creation
9. Assignment
10. Repair status
11. Before/After
12. Verification
13. Visual Timeline
```

## Tier 2

```text
14. Duplicate grouping
15. Citizen confirmation
16. Priority engine
17. Map
18. Analytics
```

## Tier 3

```text
19. Video analysis
20. Recurring issue detection
21. Street Health
22. Advanced filters
23. Notifications
```

---

# 66. Things NOT to Build

Avoid:

```text
❌ Microservices
❌ Kubernetes
❌ Complex GIS backend
❌ Custom ML training
❌ Complex computer vision pipeline
❌ Real municipal authentication
❌ Real government API integrations
❌ Mobile app
❌ Complex notification infrastructure
❌ Blockchain
```

A clean working web application is more valuable for this hackathon.

---

# 67. Final Architecture Summary

```text
                    STREETPULSE
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
   CITIZEN          MUNICIPAL           ADMIN
  DASHBOARD          DASHBOARD         DASHBOARD
       │                 │                 │
       └─────────────────┼─────────────────┘
                         ▼
                    REACT WEB APP
                         │
                         ▼
                     FASTAPI
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
     CLOUDINARY      POSTGRESQL       VISION AI
          │              │              │
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                STREETPULSE ENGINE
                         │
       ┌─────────────────┼──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
    GROUPING          PRIORITY          VERIFICATION
       │                 │                  │
       └─────────────────┼──────────────────┘
                         ▼
                 VISUAL TIMELINE
                         │
                         ▼
                 STREET HISTORY
```

---

# 68. Final Product Loop

The complete solution to the problem statement is:

```text
                    PROBLEM
                       │
                       ▼
                Citizen captures
                       │
                       ▼
               Cloudinary stores
                       │
                       ▼
                  AI understands
                       │
                       ▼
                  GPS locates
                       │
                       ▼
                Reports grouped
                       │
                       ▼
                  Priority set
                       │
                       ▼
                  Admin assigns
                       │
                       ▼
              Municipal member works
                       │
                       ▼
                Repair evidence
                       │
                       ▼
             Cloudinary stores proof
                       │
                       ▼
               AI compares before/
                     after
                       │
                       ▼
               Citizen confirms
                       │
              ┌────────┴────────┐
              ▼                 ▼
           VERIFIED           FAILED
              │                 │
              ▼                 ▼
           RESOLVED          REOPENED
              │
              ▼
        Visual street history
              │
              ▼
        Recurring problems
              │
              ▼
      Better infrastructure visibility
```

## Final positioning

> **StreetPulse turns citizen-generated photos and videos into a living visual record of urban infrastructure—from the first report to the final verified repair.**

The product closes the entire loop:

**Citizen → Evidence → AI → Incident → Admin → Municipal Member → Repair → Proof → Verification → Citizen → Resolution → Street History.**

---

# 69. Implementation Addendum (REQUIRED for Autonomous Builds)

> This addendum closes the gaps that block an AI coding agent (e.g. Claude Sonnet at low reasoning) from building StreetPulse end‑to‑end. **Read this section before any stage.** Where this addendum conflicts with earlier sections, **this addendum wins** (it is the single source of truth for enums, env, and run commands).

## 69.1 How to Use This Document With a Coding Agent

- Build **one stage at a time** (Sections 38–59). Do not start a stage until the previous stage's **Definition of Done** (Section 69.8) passes.
- Every stage prompt says *"Read docs/copilot-context.md"*. That file is defined in **Section 69.2** — create it first, in Stage 1, by copying 69.2 verbatim.
- After each stage: run the app locally (69.5), confirm it starts with no errors, then commit.
- Do **not** invent new fields, statuses, or routes. If something is missing, extend this addendum first, then implement.

---

## 69.2 `docs/copilot-context.md` (create this in Stage 1)

Create `docs/copilot-context.md` with exactly this content so every later prompt resolves:

```markdown
# StreetPulse — Copilot Context

## What we are building
A visual accountability platform for urban infrastructure. Citizens report issues
with photos/videos; AI classifies them; reports are grouped into Incidents; admins
prioritize and assign; municipal members repair and upload before/during/after
evidence; AI + citizen verify the repair; every incident keeps a visual timeline.

## Non-negotiable rules
- Modular monolith. No microservices, no Kubernetes, no blockchain.
- PostgreSQL stores structured data ONLY. All media lives in Cloudinary; DB stores
  only Cloudinary references (public_id, secure_url, thumbnail_url).
- Never expose CLOUDINARY_API_SECRET or AI_API_KEY to the frontend.
- AI is decision support, never presented as absolute proof.
- All enums come from the canonical lists in the Implementation Addendum (Section 69).

## Stack
Frontend: React + Vite + TypeScript + Tailwind + React Router + Axios + Leaflet + Recharts
Backend:  Python 3.11 + FastAPI + Pydantic v2 + SQLAlchemy 2.x + Alembic + PostgreSQL
Media:    Cloudinary
AI:       Vision-capable chat API (see Addendum 69.4)

## Roles
CITIZEN, MUNICIPAL_MEMBER, ADMIN

## Definition of Done per stage
See Implementation Addendum Section 69.8. A stage is done only when the app builds,
starts, and the listed checks pass.
```

---

## 69.3 Canonical Enums (SINGLE SOURCE OF TRUTH)

Earlier sections use `VERIFIED` for two different things. **Do not do that.** Use these exact enums everywhere (DB, Pydantic, TypeScript).

### IncidentStatus
```text
NEW                    # report(s) received, not yet AI-analyzed
AI_ANALYZED            # AI classification attached
TRIAGED                # admin reviewed/accepted (replaces the old first "VERIFIED")
ASSIGNED               # assigned to a municipal member
IN_PROGRESS            # repair work started
COMPLETED              # repair finished, evidence uploaded
AWAITING_VERIFICATION  # waiting for AI + citizen verification
REPAIR_VERIFIED        # AI + citizen agree repair succeeded (replaces 2nd "VERIFIED")
RESOLVED               # closed successfully
REQUIRES_REVIEW        # AI/citizen disagreement -> admin must decide
REOPENED               # verification failed -> goes back to IN_PROGRESS
CITIZEN_DISPUTED       # citizen disputes a RESOLVED incident
```

Allowed transitions:
```text
NEW → AI_ANALYZED → TRIAGED → ASSIGNED → IN_PROGRESS → COMPLETED → AWAITING_VERIFICATION
AWAITING_VERIFICATION → REPAIR_VERIFIED → RESOLVED
AWAITING_VERIFICATION → REQUIRES_REVIEW → (RESOLVED | REOPENED)
AWAITING_VERIFICATION → REOPENED → IN_PROGRESS
RESOLVED → CITIZEN_DISPUTED → REQUIRES_REVIEW → (RESOLVED | REOPENED)
```

### IssueType
`POTHOLE, ROAD_CRACK, WATERLOGGING, BROKEN_FOOTPATH, DAMAGED_MANHOLE, DAMAGED_SIGN, BROKEN_STREETLIGHT, OTHER`

### Severity
`LOW, MEDIUM, HIGH, CRITICAL`

### PriorityLevel
`LOW, MEDIUM, HIGH, CRITICAL`

### MediaRole
`CITIZEN_REPORT, REPAIR_BEFORE, REPAIR_DURING, REPAIR_AFTER, OTHER`

### AIVerificationResult
`VERIFIED, REQUIRES_REVIEW, FAILED`

### UserRole
`CITIZEN, MUNICIPAL_MEMBER, ADMIN`

> Implement these as Python `Enum` (stored as strings) and mirror them as TypeScript string‑literal unions in `frontend/src/types/`.

---

## 69.4 AI Service Contract (concrete)

Use one vision-capable chat API behind a single service `ai_service.py`. Keep the provider swappable via env (`AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY`). Default assumption: an OpenAI-compatible chat-completions endpoint that accepts an image URL.

**Classification call — strict JSON output. Validate with Pydantic; on invalid JSON, retry once, then fall back to `issue_type=OTHER, severity=MEDIUM, confidence=0.0`.**

System prompt:
```text
You are an infrastructure damage classifier. Look at the image and respond with
ONLY valid minified JSON, no prose, matching this schema:
{"issue_type": one of [POTHOLE,ROAD_CRACK,WATERLOGGING,BROKEN_FOOTPATH,
DAMAGED_MANHOLE,DAMAGED_SIGN,BROKEN_STREETLIGHT,OTHER],
"severity": one of [LOW,MEDIUM,HIGH,CRITICAL],
"confidence": number 0..1,
"description": short string}
```

Expected response:
```json
{"issue_type":"POTHOLE","severity":"HIGH","confidence":0.94,"description":"Large pothole affecting the road surface"}
```

**Before/after verification call** — inputs are two image URLs (before, after):
```text
Compare BEFORE and AFTER road-repair images. Respond with ONLY valid JSON:
{"improvement_detected": bool, "remaining_damage": bool,
"confidence": number 0..1, "summary": short string}
```
Map result to `AIVerificationResult`:
```text
improvement_detected && !remaining_damage && confidence>=0.8  -> VERIFIED
improvement_detected && (remaining_damage || confidence<0.8)  -> REQUIRES_REVIEW
!improvement_detected                                          -> FAILED
```

> If no AI key is configured, `ai_service` must return a deterministic **mock** result so the whole flow still runs in the demo. Gate this with `AI_PROVIDER=mock`.

---

## 69.5 Local Run & Tooling (so the agent can verify its own work)

Create `docker-compose.yml` at repo root for Postgres:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: streetpulse
      POSTGRES_PASSWORD: streetpulse
      POSTGRES_DB: streetpulse
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
volumes: { pgdata: {} }
```

Backend run commands:
```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate   # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head          # migrations
python -m app.seed            # demo data (Stage 20)
uvicorn app.main:app --reload --port 8000
```

Frontend run commands:
```bash
cd frontend
npm install
npm run dev                   # Vite on http://localhost:5173
```

Use **Alembic** for migrations (do not rely on `create_all` in production paths; `create_all` is acceptable only for the very first bring-up). Enable CORS in FastAPI for `http://localhost:5173`.

---

## 69.6 Dependency Baselines

`backend/requirements.txt`:
```text
fastapi
uvicorn[standard]
sqlalchemy>=2.0
alembic
pydantic>=2
pydantic-settings
psycopg2-binary
python-jose[cryptography]      # JWT
passlib[bcrypt]                # password hashing
python-multipart              # file uploads
cloudinary
httpx                          # AI API calls
```

`frontend` key deps:
```text
react react-dom react-router-dom axios
leaflet react-leaflet recharts
tailwindcss postcss autoprefixer
typescript vite @vitejs/plugin-react
```

---

## 69.7 Auth & Security Specifics (so Stage 3 is unambiguous)

- Passwords hashed with `passlib` bcrypt. Never store plaintext.
- JWT (HS256) signed with `JWT_SECRET` from env; `exp` ~ 24h for hackathon.
- Frontend stores the token in `localStorage` under `sp_token`; Axios interceptor adds `Authorization: Bearer`.
- Role guard: a FastAPI dependency `require_role(*roles)` returns 403 if the user's role is not allowed.
- Municipal members may only access incidents assigned to them or their department; enforce in the query, not just the UI.
- `.env` is gitignored; commit `.env.example` only.

---

## 69.8 Definition of Done (per stage stop conditions)

A low-reasoning agent must treat these as explicit exit criteria.

```text
Stage 1  Foundation   : `npm run dev` and `uvicorn` both start; GET /health -> 200;
                        docs/copilot-context.md exists.
Stage 2  DB + models  : `alembic upgrade head` creates all 8 tables; enums match 69.3.
Stage 3  Auth         : login returns JWT; GET /api/auth/me works; role guard blocks
                        wrong roles with 403.
Stage 4  Cloudinary   : POST /api/media/upload returns public_id + secure_url; row saved.
Stage 5  Reporting    : citizen can submit a report with media+location; appears in
                        GET /api/reports/my.
Stage 6  AI classify  : AIAnalysis row created; invalid JSON path falls back safely;
                        mock mode works with no AI key.
Stage 7  Grouping     : second nearby same-type report attaches to existing incident
                        (configurable radius, default 50m); else new incident.
Stage 8  Citizen UI   : overview counts, report form, my reports, details+timeline render.
Stage 9  Admin UI     : city summary counts, incident list, filters, map markers render.
Stage 10 Municipal UI : work queue + work order render for assigned incidents only.
Stage 11 Priority     : priority_score, priority_level, priority_reasons returned and shown.
Stage 12 Assignment   : admin assign sets ASSIGNED + assignee; appears in municipal queue.
Stage 13 Repair flow  : status transitions follow 69.3; illegal transitions rejected.
Stage 14 Evidence     : before/during/after upload to Cloudinary; shown on timeline.
Stage 15 AI verify    : before/after compared; maps to VERIFIED/REQUIRES_REVIEW/FAILED.
Stage 16 Citizen conf : YES->progress to RESOLVED path; NO->REQUIRES_REVIEW.
Stage 17 Timeline     : single merged chronological timeline with media renders.
Stage 18 Street page  : /street/{id} lists incidents + media; score labeled "prototype".
Stage 19 Analytics    : all Recharts charts render from real API data.
Stage 20 Seed data    : `python -m app.seed` creates the demo dataset incl. the full
                        hero incident (report->repair->verify->resolved).
Stage 21 Testing      : all Section 58 checklists pass manually.
Stage 22 Polish       : three role dashboards look distinct; no console errors.
```

---

## 69.9 Seed Data & Demo Credentials (Stage 20 detail)

`python -m app.seed` must be idempotent (safe to re-run) and create these logins:

```text
admin@streetpulse.test      / admin123     (ADMIN)
ravi@streetpulse.test       / ravi123      (MUNICIPAL_MEMBER, Road Maintenance)
citizen@streetpulse.test    / citizen123   (CITIZEN)
```

Plus the dataset in Section 57, and at least one **hero incident** (`SP-4821`) that walks through the entire lifecycle to `RESOLVED` with before/after media so the demo in Section 64 works end to end. Media may reference public Cloudinary sample URLs if live uploads aren't available.

---

## 69.10 Minimal Automated Tests (recommended, keep small)

Backend `pytest` smoke tests (not exhaustive):
```text
- auth: login returns token; wrong password -> 401
- reports: create report -> 201; appears in /my
- grouping: two nearby same-type reports -> one incident
- transitions: illegal status transition -> 400
```
That is enough coverage for a hackathon; do not build a full test pyramid.

---

## 69.11 Verdict

With Sections 69.2–69.10 added, the plan is now **sufficient for end-to-end autonomous implementation**: the context file exists, enums are consistent, the AI contract is concrete and mockable, local run + migrations are defined, and every stage has an explicit Definition of Done. Build stage-by-stage and gate on 69.8.
