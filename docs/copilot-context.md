# StreetPulse - Copilot context

Visual accountability platform for urban infrastructure. Full spec: `../StreetPulse_End_to_End_Architecture_Copilot_Build.md`.

Rules:
- Modular monolith, no microservices.
- PostgreSQL = structured data, Cloudinary = media. Never store binaries in the DB.
- Roles: CITIZEN, MUNICIPAL_MEMBER, ADMIN; each has a separate dashboard.
- Priority must be explainable (rule-based, reasons shown).
- AI is decision support only.
- Never expose CLOUDINARY_API_SECRET to the frontend; never commit `.env`.
