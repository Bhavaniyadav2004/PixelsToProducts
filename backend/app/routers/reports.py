from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Incident, Report, User
from ..schemas import CitizenVerificationIn, ReportCreate
from ..services import incident_service, serializers, verification_service
from .deps import get_current_user, require_roles

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("", status_code=201)
def create_report(body: ReportCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("CITIZEN"))):
    incident, report, created = incident_service.submit_report(db, user, body)
    return {
        "report_id": report.id, "created_new_incident": created,
        "incident": serializers.incident_out(incident),
    }


@router.get("/my")
def my_reports(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    reports = db.scalars(select(Report).where(Report.user_id == user.id).order_by(Report.created_at.desc())).all()
    pool = serializers.all_incidents(db)
    return [
        {"id": r.id, "description": r.description, "created_at": r.created_at,
         "incident": serializers.incident_out(r.incident, pool)}
        for r in reports
    ]


@router.get("/{report_id}")
def get_report(report_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    r = db.get(Report, report_id)
    if not r:
        raise HTTPException(404, "Report not found")
    if user.role == "CITIZEN" and r.user_id != user.id:
        raise HTTPException(403, "Not your report")
    pool = serializers.all_incidents(db)
    return {"id": r.id, "description": r.description, "created_at": r.created_at,
            "incident": serializers.incident_out(r.incident, pool, detail=True, db=db)}


@router.post("/{report_id}/citizen-verification")
def citizen_verification(report_id: int, body: CitizenVerificationIn, db: Session = Depends(get_db),
                         user: User = Depends(require_roles("CITIZEN"))):
    r = db.get(Report, report_id)
    if not r or r.user_id != user.id:
        raise HTTPException(404, "Report not found")
    inc: Incident = r.incident
    verification_service.record_citizen_result(db, inc, user, body.confirmed, body.notes)
    db.commit()
    db.refresh(inc)
    return serializers.incident_out(inc, detail=True, db=db)
