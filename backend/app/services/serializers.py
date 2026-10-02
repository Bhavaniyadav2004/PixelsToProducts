from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Incident, Media
from . import incident_service, priority_service, verification_service


def media_out(m: Media) -> dict:
    return {
        "id": m.id, "incident_id": m.incident_id, "report_id": m.report_id, "uploaded_by": m.uploaded_by,
        "media_type": m.media_type, "media_role": m.media_role, "url": m.cloudinary_url,
        "thumbnail_url": m.thumbnail_url or (m.cloudinary_url if m.media_type == "image" else None),
        "public_id": m.cloudinary_public_id, "created_at": m.created_at,
    }


def analysis_out(a) -> dict | None:
    if not a:
        return None
    return {"issue_type": a.issue_type, "severity": a.severity, "confidence": a.confidence,
            "description": a.description, "created_at": a.created_at}


def verification_out(v) -> dict | None:
    if not v:
        return None
    return {"id": v.id, "ai_result": v.ai_result, "ai_confidence": v.ai_confidence, "ai_summary": v.ai_summary,
            "citizen_result": v.citizen_result, "final_status": v.final_status, "created_at": v.created_at}


def incident_out(inc: Incident, pool: list[Incident] | None = None, detail: bool = False, db: Session | None = None) -> dict:
    if pool is None:
        pool = [inc]
    rec = incident_service.recurrence_count(inc, pool)
    from ..config import settings

    thumb = next((m for m in inc.media if m.media_role == "CITIZEN_REPORT"), None)
    data = {
        "id": inc.id, "incident_code": inc.incident_code, "issue_type": inc.issue_type, "severity": inc.severity,
        "priority_score": inc.priority_score, "priority_level": inc.priority_level, "priority_locked": inc.priority_locked,
        "status": inc.status, "latitude": inc.latitude, "longitude": inc.longitude,
        "street_name": inc.street_name, "street_slug": inc.street_slug, "description": inc.description,
        "department": {"id": inc.department.id, "name": inc.department.name} if inc.department else None,
        "assigned_user": {"id": inc.assigned_user.id, "name": inc.assigned_user.name} if inc.assigned_user else None,
        "due_date": inc.due_date, "accepted_at": inc.accepted_at, "resolved_at": inc.resolved_at,
        "report_count": len(inc.reports), "first_reported_at": inc.first_reported_at,
        "last_reported_at": inc.last_reported_at, "created_at": inc.created_at,
        "recurrence_count": rec, "recurring": rec >= settings.RECURRING_THRESHOLD,
        "thumbnail_url": (thumb.thumbnail_url or thumb.cloudinary_url) if thumb else None,
    }
    if detail:
        prio = priority_service.compute(inc)
        before, after = verification_service.pick_before_after(inc)
        data.update({
            "priority_reasons": prio["priority_reasons"],
            "reports": [{"id": r.id, "user_id": r.user_id, "user_name": r.user.name, "description": r.description,
                         "created_at": r.created_at} for r in inc.reports],
            "media": [
                {**media_out(m), "analysis": analysis_out(incident_service.media_analysis(db, m.id)) if db else None}
                for m in inc.media
            ],
            "timeline": [
                {"id": e.id, "event_type": e.event_type, "title": e.title, "detail": e.detail,
                 "media_url": e.media_url, "thumbnail_url": e.thumbnail_url, "media_type": e.media_type,
                 "actor_name": e.actor_name, "created_at": e.created_at}
                for e in sorted(inc.events, key=lambda e: (e.created_at, e.id))
            ],
            "repair_updates": [{"id": u.id, "status": u.status, "notes": u.notes, "by": u.user.name,
                                "created_at": u.created_at} for u in inc.repair_updates],
            "verification": verification_out(verification_service.latest(inc)),
            "before": media_out(before) if before else None,
            "after": media_out(after) if after else None,
        })
    return data


def all_incidents(db: Session) -> list[Incident]:
    return list(db.scalars(select(Incident).order_by(Incident.created_at.desc())).all())
