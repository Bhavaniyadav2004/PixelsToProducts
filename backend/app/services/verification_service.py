from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models import Incident, RepairUpdate, Verification
from . import ai_service, priority_service
from .timeline_service import add_event, set_status

HIGH_CONFIDENCE = 0.75


def pick_before_after(incident: Incident):
    repair_before = [m for m in incident.media if m.media_role == "REPAIR_BEFORE"]
    citizen = [m for m in incident.media if m.media_role == "CITIZEN_REPORT"]
    after = [m for m in incident.media if m.media_role == "REPAIR_AFTER"]
    before = repair_before[-1] if repair_before else (citizen[-1] if citizen else None)
    return before, (after[-1] if after else None)


def latest(incident: Incident) -> Verification | None:
    return incident.verifications[-1] if incident.verifications else None


def run_ai_verification(db: Session, incident: Incident) -> Verification:
    before, after = pick_before_after(incident)
    if not after:
        raise HTTPException(400, "An AFTER repair image is required")
    if not before:
        raise HTTPException(400, "No BEFORE image available for comparison")

    result, meta = ai_service.verify_repair(
        before.thumbnail_url or before.cloudinary_url if before.media_type == "video" else before.cloudinary_url,
        after.cloudinary_url,
    )
    if not result.improvement_detected:
        outcome = "FAILED"
    elif result.remaining_damage:
        outcome = "FAILED" if result.confidence >= 0.7 else "REQUIRES_REVIEW"
    elif result.confidence >= HIGH_CONFIDENCE:
        outcome = "VERIFIED"
    else:
        outcome = "REQUIRES_REVIEW"

    v = Verification(
        incident_id=incident.id, ai_result=outcome, ai_confidence=result.confidence,
        ai_summary=result.summary, notes=f"source={meta['source']}",
    )
    db.add(v)
    db.flush()
    incident.verifications.append(v)
    add_event(db, incident, "AI_VERIFICATION", f"AI verification: {outcome.replace('_', ' ').title()}",
              f"{result.summary} (confidence {result.confidence:.0%}; decision support only)", after, "StreetPulse AI")
    finalize(db, incident, v)
    return v


def finalize(db: Session, incident: Incident, v: Verification) -> None:
    """Combine AI + citizen outcomes into the incident status."""
    if v.ai_result == "FAILED":
        set_status(db, incident, "IN_PROGRESS")
        v.final_status = "FAILED"
        add_event(db, incident, "REOPENED", "Repair reopened", "AI verification found the repair incomplete", None, "System")
        db.add(RepairUpdate(incident_id=incident.id, updated_by=incident.assigned_user_id or 1,
                            status="IN_PROGRESS", notes="Repair reopened after failed AI verification"))
    elif v.citizen_result is None:
        set_status(db, incident, "AWAITING_VERIFICATION")
        v.final_status = "PENDING"
    elif v.citizen_result == "NO" or v.ai_result != "VERIFIED":
        set_status(db, incident, "REQUIRES_REVIEW")
        v.final_status = "REQUIRES_REVIEW"
        add_event(db, incident, "REVIEW", "Sent for admin review",
                  "AI and citizen outcomes disagree or are inconclusive", None, "System")
    else:
        set_status(db, incident, "RESOLVED")
        v.final_status = "RESOLVED"
        add_event(db, incident, "RESOLVED", "Resolved", "Repair verified by AI and confirmed by citizen", None, "System")
    priority_service.refresh(db, incident)


def record_citizen_result(db: Session, incident: Incident, user, confirmed: bool, notes: str | None) -> Verification:
    v = latest(incident)
    if not v or incident.status not in ("AWAITING_VERIFICATION", "REQUIRES_REVIEW"):
        raise HTTPException(400, "This incident is not awaiting citizen confirmation")
    v.citizen_result = "YES" if confirmed else "NO"
    if notes:
        v.notes = (v.notes or "") + f" | citizen: {notes}"
    add_event(db, incident, "CITIZEN_CONFIRMATION",
              "Citizen confirmed the repair" if confirmed else "Citizen disputes the repair",
              notes, None, user)
    if v.ai_result == "FAILED":
        v.final_status = "FAILED"
    else:
        finalize(db, incident, v)
    return v
