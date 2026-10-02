from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..constants import SEV_RANK
from ..database import get_db
from ..models import Incident, User
from ..schemas import IncidentPatch
from ..services import incident_service, priority_service, serializers
from ..services.timeline_service import add_event, set_status
from .deps import get_current_user, get_incident_or_404, require_roles

router = APIRouter(prefix="/api", tags=["incidents"])


@router.get("/incidents")
def list_incidents(
    status: str | None = None, severity: str | None = None, issue_type: str | None = None,
    db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    pool = serializers.all_incidents(db)
    items = [i for i in pool
             if (not status or i.status == status) and (not severity or i.severity == severity)
             and (not issue_type or i.issue_type == issue_type)]
    return [serializers.incident_out(i, pool) for i in items]


@router.get("/incidents/{incident_id}")
def get_incident(incident_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    inc = get_incident_or_404(db, incident_id)
    return serializers.incident_out(inc, serializers.all_incidents(db), detail=True, db=db)


@router.patch("/incidents/{incident_id}")
def patch_incident(incident_id: int, body: IncidentPatch, db: Session = Depends(get_db),
                   admin: User = Depends(require_roles("ADMIN"))):
    inc = get_incident_or_404(db, incident_id)
    if body.priority_level:
        inc.priority_level = body.priority_level
        inc.priority_locked = True
        add_event(db, inc, "PRIORITY", f"Priority set to {body.priority_level}", body.note, None, admin)
    elif body.unlock_priority:
        inc.priority_locked = False
    if body.status and body.status != inc.status:
        old = inc.status
        set_status(db, inc, body.status)
        title = "Incident reopened" if old == "RESOLVED" else f"Status changed to {body.status.replace('_', ' ').title()}"
        add_event(db, inc, "ADMIN", title, body.note, None, admin)
    priority_service.refresh(db, inc)
    db.commit()
    return serializers.incident_out(inc, serializers.all_incidents(db), detail=True, db=db)


@router.get("/streets")
def list_streets(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    streets: dict[str, dict] = {}
    for i in serializers.all_incidents(db):
        s = streets.setdefault(i.street_slug, {"street_id": i.street_slug, "street_name": i.street_name, "total": 0, "open": 0})
        s["total"] += 1
        s["open"] += i.status != "RESOLVED"
    return sorted(streets.values(), key=lambda s: -s["total"])


@router.get("/streets/{slug}")
def street_detail(slug: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    pool = serializers.all_incidents(db)
    items = [i for i in pool if i.street_slug == slug]
    if not items:
        raise HTTPException(404, "Street not found")
    out = [serializers.incident_out(i, pool, detail=True, db=db) for i in items]
    out.sort(key=lambda x: x["first_reported_at"])
    open_items = [i for i in items if i.status != "RESOLVED"]
    worst = max((SEV_RANK[i.severity] for i in open_items), default=-1)
    condition = "GOOD" if not open_items else ("POOR" if worst >= 2 else "FAIR")
    return {
        "street_id": slug, "street_name": items[0].street_name,
        "condition": condition,
        "condition_note": "Prototype indicator, not a scientific road-quality score. "
                          "GOOD = no open incidents; FAIR = open incidents of LOW/MEDIUM severity; "
                          "POOR = at least one open HIGH/CRITICAL incident.",
        "total_incidents": len(items), "resolved_incidents": len(items) - len(open_items),
        "recurring_incidents": sum(1 for o in out if o["recurring"]),
        "incidents": out,
    }
