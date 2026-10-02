from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import Media, User
from ..services import cloudinary_service
from ..services.serializers import media_out
from .deps import get_current_user

router = APIRouter(prefix="/api/media", tags=["media"])


def store_upload(db: Session, file: UploadFile, user: User, role: str, folder: str, prefix: str,
                 incident_id: int | None = None, tags: list[str] | None = None) -> Media:
    ctype = file.content_type or ""
    if ctype.startswith("image/"):
        media_type = "image"
    elif ctype.startswith("video/"):
        media_type = "video"
    else:
        raise HTTPException(400, "Only image or video files are allowed")
    data = file.file.read(settings.MAX_UPLOAD_MB * 1024 * 1024 + 1)
    if len(data) > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(413, f"File exceeds {settings.MAX_UPLOAD_MB} MB")
    if not data:
        raise HTTPException(400, "Empty file")
    try:
        ref = cloudinary_service.upload_media(data, file.filename or "upload", media_type, folder, prefix, tags)
    except Exception as exc:
        raise HTTPException(502, f"Media upload failed: {exc}")
    m = Media(
        incident_id=incident_id, uploaded_by=user.id, media_type=media_type, media_role=role,
        cloudinary_public_id=ref["public_id"], cloudinary_url=ref["url"], thumbnail_url=ref["thumbnail_url"],
    )
    db.add(m)
    db.commit()
    return m


@router.post("/upload")
def upload(file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Citizen evidence upload; attached to an incident when the report is submitted."""
    m = store_upload(db, file, user, "CITIZEN_REPORT", "streetpulse/pending/citizen", "evidence")
    return media_out(m)


@router.delete("/{media_id}")
def delete(media_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    m = db.get(Media, media_id)
    if not m:
        raise HTTPException(404, "Media not found")
    if user.role != "ADMIN" and (m.uploaded_by != user.id or m.report_id is not None):
        raise HTTPException(403, "Cannot delete this media")
    cloudinary_service.delete_media(m.cloudinary_public_id, m.media_type, m.cloudinary_url)
    db.delete(m)
    db.commit()
    return {"ok": True}
