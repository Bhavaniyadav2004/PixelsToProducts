"""Explainable rule-based priority: severity 40, reports 20, progression 15, age 15, traffic 10."""
from datetime import datetime

from sqlalchemy.orm import Session

from ..constants import SEV_RANK
from ..models import Incident

SEV_FACTOR = {"LOW": 0.25, "MEDIUM": 0.5, "HIGH": 0.8, "CRITICAL": 1.0}
TRAFFIC_WORDS = ("highway", "ring road", "main", "junction", "avenue", "expressway", "bridge", "mg road", "nh")


def level_for(score: float) -> str:
    if score >= 75:
        return "CRITICAL"
    if score >= 55:
        return "HIGH"
    if score >= 35:
        return "MEDIUM"
    return "LOW"


def compute(incident: Incident, now: datetime | None = None) -> dict:
    now = now or datetime.utcnow()
    n_reports = len(incident.reports)
    end = incident.resolved_at or now
    age_days = max((end - incident.first_reported_at).days, 0)
    progressed = SEV_RANK[incident.severity] > SEV_RANK[incident.initial_severity]
    busy = any(w in incident.street_name.lower() for w in TRAFFIC_WORDS)

    parts = {
        "severity": 40 * SEV_FACTOR[incident.severity],
        "reports": 20 * min(n_reports / 10, 1),
        "progression": 15 if progressed else 0,
        "age": 15 * min(age_days / 30, 1),
        "traffic": 10 * (1.0 if busy else 0.4),
    }
    score = round(sum(parts.values()), 1)

    reasons = [f"{incident.severity.capitalize()} severity (+{parts['severity']:.0f})"]
    reasons.append(f"{n_reports} citizen report{'s' if n_reports != 1 else ''} (+{parts['reports']:.0f})")
    if progressed:
        reasons.append(f"Damage increasing: {incident.initial_severity} to {incident.severity} (+15)")
    reasons.append(f"{'Unresolved for' if not incident.resolved_at else 'Open for'} {age_days} day{'s' if age_days != 1 else ''} (+{parts['age']:.0f})")
    reasons.append(
        f"{'Located on a high-traffic road' if busy else 'Standard traffic location'} (+{parts['traffic']:.0f})"
    )
    return {"priority_score": score, "priority_level": level_for(score), "priority_reasons": reasons, "breakdown": parts}


def refresh(db: Session, incident: Incident) -> dict:
    result = compute(incident)
    incident.priority_score = result["priority_score"]
    if not incident.priority_locked:
        incident.priority_level = result["priority_level"]
    return result
