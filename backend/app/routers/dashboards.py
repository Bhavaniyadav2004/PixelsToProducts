from collections import Counter, defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..constants import SEVERITIES, STATUSES
from ..database import get_db
from ..models import Department, Incident, User
from ..schemas import AssignIn, UserCreate, UserOut, UserUpdate
from ..services import priority_service, serializers, verification_service
from ..services.incident_service import recurrence_count
from ..services.timeline_service import add_event, set_status
from ..utils.security import hash_password
from .deps import get_incident_or_404, require_roles

router = APIRouter(prefix="/api/admin", tags=["admin"])
admin_only = require_roles("ADMIN")


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    items = serializers.all_incidents(db)
    open_items = [i for i in items if i.status != "RESOLVED"]
    queue = sorted(open_items, key=lambda i: -i.priority_score)[:8]
    return {
        "total": len(items),
        "by_severity": {s: sum(i.severity == s for i in items) for s in SEVERITIES},
        "by_status": {s: sum(i.status == s for i in items) for s in STATUSES},
        "in_progress": sum(i.status == "IN_PROGRESS" for i in items),
        "awaiting_verification": sum(i.status in ("AWAITING_VERIFICATION", "REQUIRES_REVIEW") for i in items),
        "resolved": sum(i.status == "RESOLVED" for i in items),
        "unassigned": sum(i.status in ("NEW", "VERIFIED") for i in items),
        "priority_queue": [serializers.incident_out(i, items) for i in queue],
        "map": [serializers.incident_out(i, items) for i in items],
    }


@router.get("/incidents")
def incidents(status: str | None = None, severity: str | None = None, issue_type: str | None = None,
              priority_level: str | None = None, q: str | None = None,
              db: Session = Depends(get_db), _: User = Depends(admin_only)):
    pool = serializers.all_incidents(db)
    out = []
    for i in pool:
        if status and i.status != status:
            continue
        if severity and i.severity != severity:
            continue
        if issue_type and i.issue_type != issue_type:
            continue
        if priority_level and i.priority_level != priority_level:
            continue
        if q and q.lower() not in f"{i.incident_code} {i.street_name}".lower():
            continue
        out.append(serializers.incident_out(i, pool))
    return sorted(out, key=lambda x: -x["priority_score"])


@router.post("/incidents/{incident_id}/assign")
def assign(incident_id: int, body: AssignIn, db: Session = Depends(get_db), admin: User = Depends(admin_only)):
    inc = get_incident_or_404(db, incident_id)
    if inc.status == "RESOLVED":
        raise HTTPException(409, "Reopen the incident before assigning")
    member = db.get(User, body.user_id)
    if not member or member.role != "MUNICIPAL_MEMBER":
        raise HTTPException(400, "user_id must be a municipal member")
    dept_id = body.department_id or member.department_id
    if dept_id and not db.get(Department, dept_id):
        raise HTTPException(400, "Unknown department")
    reassign = inc.assigned_user_id is not None
    inc.assigned_user_id, inc.assigned_department_id, inc.due_date = member.id, dept_id, body.due_date
    inc.accepted_at = None
    if inc.status in ("NEW", "VERIFIED", "IN_PROGRESS", "ASSIGNED", "REQUIRES_REVIEW"):
        if inc.status == "NEW":
            add_event(db, inc, "VERIFIED", "Reviewed by admin", None, None, admin)
        set_status(db, inc, "ASSIGNED")
    dept = db.get(Department, dept_id) if dept_id else None
    due = f", due {body.due_date:%d %b %Y}" if body.due_date else ""
    add_event(db, inc, "ASSIGNED", "Reassigned" if reassign else "Assigned",
              f"{member.name}{' (' + dept.name + ')' if dept else ''}{due}", None, admin)
    db.commit()
    return serializers.incident_out(inc, serializers.all_incidents(db), detail=True, db=db)


@router.get("/verification-queue")
def verification_queue(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    pool = serializers.all_incidents(db)
    out = []
    for i in pool:
        v = verification_service.latest(i)
        if not v or i.status == "RESOLVED":
            continue
        if v.ai_result == "FAILED":
            kind = "FAILED"
        elif v.citizen_result == "NO":
            kind = "DISPUTED"
        elif i.status == "REQUIRES_REVIEW":
            kind = "REVIEW"
        elif i.status == "AWAITING_VERIFICATION":
            kind = "AWAITING"
        else:
            continue
        data = serializers.incident_out(i, pool, detail=True, db=db)
        out.append({"kind": kind, "incident": data})
    return out


@router.get("/analytics")
def analytics(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    items = serializers.all_incidents(db)
    by_type = Counter(i.issue_type for i in items)
    by_sev = Counter(i.severity for i in items)
    resolved = [i for i in items if i.resolved_at]
    days = [(i.resolved_at - i.first_reported_at).total_seconds() / 86400 for i in resolved]
    verifs = [v for i in items for v in i.verifications]
    outcome = Counter(v.ai_result for v in verifs)
    final = Counter(v.final_status for v in verifs)

    workload: dict[str, dict] = defaultdict(lambda: {"open": 0, "resolved": 0})
    for i in items:
        name = i.department.name if i.department else "Unassigned"
        workload[name]["resolved" if i.status == "RESOLVED" else "open"] += 1

    seen, clusters = set(), []
    for i in items:
        if i.id in seen:
            continue
        group = [o for o in items if o.issue_type == i.issue_type and recurrence_count(i, [o]) == 1]
        if len(group) >= settings.RECURRING_THRESHOLD:
            seen.update(o.id for o in group)
            span = (max(o.first_reported_at for o in group) - min(o.first_reported_at for o in group)).days
            clusters.append({"street_name": i.street_name, "street_slug": i.street_slug, "issue_type": i.issue_type,
                             "incidents": len(group), "span_days": span, "codes": [o.incident_code for o in group]})

    return {
        "by_type": [{"name": k, "value": v} for k, v in by_type.items()],
        "by_severity": [{"name": s, "value": by_sev.get(s, 0)} for s in SEVERITIES],
        "open_vs_resolved": [
            {"name": "Open", "value": sum(i.status != "RESOLVED" for i in items)},
            {"name": "Resolved", "value": len(resolved)},
        ],
        "verification_outcomes": [{"name": k, "value": v} for k, v in outcome.items()],
        "final_outcomes": [{"name": k, "value": v} for k, v in final.items()],
        "department_workload": [{"name": k, **v} for k, v in workload.items()],
        "recurring": clusters,
        "avg_resolution_days": round(sum(days) / len(days), 1) if days else None,
        "resolved_count": len(resolved),
    }


@router.get("/users")
def users(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    return [{**UserOut.model_validate(u).model_dump(), "department": u.department.name if u.department else None}
            for u in db.scalars(select(User).order_by(User.role, User.name)).all()]


@router.post("/users", status_code=201)
def create_user(body: UserCreate, db: Session = Depends(get_db), _: User = Depends(admin_only)):
    email = body.email.lower()
    if db.scalars(select(User).where(User.email == email)).first():
        raise HTTPException(409, "Email already registered")
    u = User(name=body.name, email=email, password_hash=hash_password(body.password),
             role=body.role, department_id=body.department_id)
    db.add(u)
    db.commit()
    return UserOut.model_validate(u)


@router.patch("/users/{user_id}")
def update_user(user_id: int, body: UserUpdate, db: Session = Depends(get_db), _: User = Depends(admin_only)):
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(404, "User not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(u, k, v)
    db.commit()
    return UserOut.model_validate(u)
