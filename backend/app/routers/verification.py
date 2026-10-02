from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AIAnalysis, Incident, Media, User
from ..services import ai_service, serializers, verification_service
from .deps import can_work, get_current_user, get_incident_or_404

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/analyze/{media_id}")
def analyze(media_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    m = db.get(Media, media_id)
    if not m:
        raise HTTPException(404, "Media not found")
    if user.role != "ADMIN" and m.uploaded_by != user.id:
        raise HTTPException(403, "Not your media")
    url = m.cloudinary_url if m.media_type == "image" else m.thumbnail_url
    if not url:
        raise HTTPException(400, "No analyzable image for this media")
    result, meta = ai_service.analyze_image(url, seed=m.cloudinary_public_id)
    row = AIAnalysis(media_id=m.id, issue_type=result.issue_type, severity=result.severity,
                     confidence=result.confidence, description=result.description, raw_response=str(meta))
    db.add(row)
    db.commit()
    return {**serializers.analysis_out(row), "media_id": m.id, "source": meta["source"]}


@router.post("/verify/{incident_id}")
def verify(incident_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    inc: Incident = get_incident_or_404(db, incident_id)
    if not can_work(user, inc):
        raise HTTPException(403, "Not permitted")
    v = verification_service.run_ai_verification(db, inc)
    db.commit()
    return serializers.verification_out(v)
