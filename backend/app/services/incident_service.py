import math
import re
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..constants import SEV_RANK
from ..models import AIAnalysis, Incident, Media, Report, User
from ..schemas import ReportCreate
from . import cloudinary_service, priority_service
from .timeline_service import add_event


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi, dlmb = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "unnamed"


def find_matching_incident(db: Session, issue_type: str, lat: float, lon: float) -> Incident | None:
    """Same issue type, unresolved, within the configured radius; nearest wins."""
    candidates = db.scalars(
        select(Incident).where(Incident.issue_type == issue_type, Incident.status != "RESOLVED")
    ).all()
    best, best_d = None, None
    for inc in candidates:
        d = haversine_m(lat, lon, inc.latitude, inc.longitude)
        if d <= settings.GROUPING_RADIUS_METERS and (best_d is None or d < best_d):
            best, best_d = inc, d
    return best


def recurrence_count(incident: Incident, pool: list[Incident]) -> int:
    """Incidents of the same type within the radius, including this one."""
    return sum(
        1 for o in pool
        if o.issue_type == incident.issue_type
        and haversine_m(incident.latitude, incident.longitude, o.latitude, o.longitude) <= settings.GROUPING_RADIUS_METERS
    )


def submit_report(db: Session, user: User, payload: ReportCreate) -> tuple[Incident, Report, bool]:
    media_items = db.scalars(select(Media).where(Media.id.in_(payload.media_ids))).all()
    if len(media_items) != len(set(payload.media_ids)):
        raise HTTPException(404, "Media not found")
    for m in media_items:
        if m.uploaded_by != user.id or m.report_id is not None:
            raise HTTPException(400, "Media is not available for this report")

    incident = find_matching_incident(db, payload.issue_type, payload.latitude, payload.longitude)
    created = incident is None
    now = datetime.utcnow()
    street = (payload.street_name or "").strip() or f"Location {payload.latitude:.4f}, {payload.longitude:.4f}"

    if created:
        incident = Incident(
            issue_type=payload.issue_type, severity=payload.severity, initial_severity=payload.severity,
            latitude=payload.latitude, longitude=payload.longitude,
            street_name=street, street_slug=slugify(street), description=payload.description,
            status="NEW", first_reported_at=now, last_reported_at=now,
        )
        db.add(incident)
        db.flush()
        incident.incident_code = f"SP-{1000 + incident.id}"

    report = Report(
        incident_id=incident.id, user_id=user.id, description=payload.description,
        latitude=payload.latitude, longitude=payload.longitude,
    )
    db.add(report)
    db.flush()

    for m in media_items:
        moved = cloudinary_service.move_to_incident(m.cloudinary_public_id, m.media_type, incident.incident_code, "citizen")
        if moved:
            m.cloudinary_public_id, m.cloudinary_url, m.thumbnail_url = moved["public_id"], moved["url"], moved["thumbnail_url"]
        m.incident_id = incident.id
        m.report_id = report.id
        add_event(db, incident, "REPORT", "Citizen report" if not created else "First report", payload.description, m, user)
    if not media_items:
        add_event(db, incident, "REPORT", "Citizen report", payload.description, None, user)

    if not created:
        incident.last_reported_at = now
        if SEV_RANK[payload.severity] > SEV_RANK[incident.severity]:
            add_event(db, incident, "PROGRESSION", "Damage appears worse",
                      f"Severity raised from {incident.severity} to {payload.severity}", None, "System")
            incident.severity = payload.severity
        db.flush()
    db.refresh(incident)
    priority_service.refresh(db, incident)
    db.commit()
    return incident, report, created


def media_analysis(db: Session, media_id: int) -> AIAnalysis | None:
    return db.scalars(
        select(AIAnalysis).where(AIAnalysis.media_id == media_id).order_by(AIAnalysis.created_at.desc())
    ).first()
