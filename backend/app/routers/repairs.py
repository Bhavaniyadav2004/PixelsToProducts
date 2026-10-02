from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Incident, RepairUpdate, User
from ..schemas import WorkAction
from ..services import priority_service, serializers, verification_service
from ..services.timeline_service import add_event, set_status
from .deps import can_work, get_incident_or_404, require_roles
from .media import store_upload

router = APIRouter(prefix="/api/municipal", tags=["municipal"])
municipal_only = require_roles("MUNICIPAL_MEMBER", "ADMIN")


def _mine(db: Session, user: User) -> list[Incident]:
    items = serializers.all_incidents(db)
    return [i for i in items if can_work(user, i)] if user.role != "ADMIN" else items


def _work_item(inc: Incident, pool: list[Incident]) -> dict:
    return serializers.incident_out(inc, pool)


def _get_work_order(db: Session, user: User, incident_id: int) -> Incident:
    inc = get_incident_or_404(db, incident_id)
    if not can_work(user, inc):
        raise HTTPException(403, "This incident is not assigned to you or your department")
    if inc.status in ("NEW", "VERIFIED"):
        raise HTTPException(409, "Incident has not been assigned yet")
    return inc


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user: User = Depends(municipal_only)):
    mine = [i for i in _mine(db, user) if i.assigned_user_id == user.id or user.role != "ADMIN"]
    today = datetime.utcnow().date()
    return {
        "assigned": sum(i.status == "ASSIGNED" for i in mine),
        "in_progress": sum(i.status == "IN_PROGRESS" for i in mine),
        "due_today": sum(1 for i in mine if i.due_date and i.due_date.date() <= today and i.status in ("ASSIGNED", "IN_PROGRESS")),
        "awaiting_verification": sum(i.status in ("AWAITING_VERIFICATION", "REQUIRES_REVIEW") for i in mine),
        "total": len(mine),
    }


@router.get("/work-orders")
def work_orders(priority: str | None = None, status: str | None = None, due: str | None = None,
                issue_type: str | None = None, db: Session = Depends(get_db), user: User = Depends(municipal_only)):
    pool = serializers.all_incidents(db)
    items = [i for i in _mine(db, user) if i.status not in ("NEW", "VERIFIED")]
    if status and status != "ALL":
        items = [i for i in items if i.status == status]
    elif not status:
        items = [i for i in items if i.status != "RESOLVED"]
    if priority:
        items = [i for i in items if i.priority_level == priority]
    if issue_type:
        items = [i for i in items if i.issue_type == issue_type]
    now = datetime.utcnow()
    if due == "today":
        items = [i for i in items if i.due_date and i.due_date.date() <= now.date()]
    elif due == "week":
        items = [i for i in items if i.due_date and i.due_date <= now + timedelta(days=7)]
    items.sort(key=lambda i: -i.priority_score)
    return [_work_item(i, pool) for i in items]


@router.get("/work-orders/{incident_id}")
def work_order(incident_id: int, db: Session = Depends(get_db), user: User = Depends(municipal_only)):
    inc = _get_work_order(db, user, incident_id)
    return serializers.incident_out(inc, serializers.all_incidents(db), detail=True, db=db)


@router.patch("/work-orders/{incident_id}/status")
def update_status(incident_id: int, body: WorkAction, db: Session = Depends(get_db), user: User = Depends(municipal_only)):
    inc = _get_work_order(db, user, incident_id)
    a = body.action

    def log(status: str):
        db.add(RepairUpdate(incident_id=inc.id, updated_by=user.id, status=status, notes=body.notes))

    if a == "accept":
        if inc.status != "ASSIGNED":
            raise HTTPException(409, "Only ASSIGNED work can be accepted")
        inc.accepted_at = datetime.utcnow()
        add_event(db, inc, "ACCEPTED", "Assignment accepted", body.notes, None, user)
        log(inc.status)
    elif a == "start":
        if inc.status != "ASSIGNED":
            raise HTTPException(409, "Work can only be started from ASSIGNED")
        inc.accepted_at = inc.accepted_at or datetime.utcnow()
        set_status(db, inc, "IN_PROGRESS")
        add_event(db, inc, "REPAIR_STARTED", "Repair started", body.notes, None, user)
        log("IN_PROGRESS")
    elif a == "note":
        if not body.notes:
            raise HTTPException(400, "Note text is required")
        add_event(db, inc, "NOTE", "Work note", body.notes, None, user)
        log(inc.status)
    elif a == "complete":
        if inc.status != "IN_PROGRESS":
            raise HTTPException(409, "Only IN_PROGRESS work can be completed")
        if not any(m.media_role == "REPAIR_AFTER" for m in inc.media):
            raise HTTPException(400, "Upload at least an AFTER image before completing")
        set_status(db, inc, "COMPLETED")
        add_event(db, inc, "REPAIR_COMPLETED", "Repair completed", body.notes, None, user)
        log("COMPLETED")
        db.flush()
        verification_service.run_ai_verification(db, inc)
    priority_service.refresh(db, inc)
    db.commit()
    return serializers.incident_out(inc, serializers.all_incidents(db), detail=True, db=db)


@router.post("/work-orders/{incident_id}/media")
def upload_evidence(incident_id: int, stage: str = Form(...), file: UploadFile = File(...),
                    db: Session = Depends(get_db), user: User = Depends(municipal_only)):
    stage = stage.upper()
    if stage not in ("BEFORE", "DURING", "AFTER"):
        raise HTTPException(400, "stage must be BEFORE, DURING or AFTER")
    inc = _get_work_order(db, user, incident_id)
    if inc.status not in ("ASSIGNED", "IN_PROGRESS"):
        raise HTTPException(409, "Evidence can only be added while work is open")
    m = store_upload(
        db, file, user, f"REPAIR_{stage}", f"streetpulse/incidents/{inc.incident_code}/repair",
        stage.lower(), incident_id=inc.id, tags=[inc.incident_code, inc.issue_type, stage.lower()],
    )
    add_event(db, inc, f"REPAIR_{stage}", f"Repair evidence: {stage.title()}", None, m, user)
    db.commit()
    return serializers.media_out(m)
