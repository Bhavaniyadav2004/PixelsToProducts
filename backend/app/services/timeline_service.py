from datetime import datetime

from sqlalchemy.orm import Session

from ..models import Incident, Media, TimelineEvent, User


def add_event(
    db: Session,
    incident: Incident,
    event_type: str,
    title: str,
    detail: str | None = None,
    media: Media | None = None,
    actor: User | str | None = None,
    created_at: datetime | None = None,
) -> TimelineEvent:
    ev = TimelineEvent(
        incident_id=incident.id,
        event_type=event_type,
        title=title,
        detail=detail,
        media_url=media.cloudinary_url if media else None,
        thumbnail_url=(media.thumbnail_url or media.cloudinary_url) if media else None,
        media_type=media.media_type if media else None,
        actor_name=actor.name if isinstance(actor, User) else actor,
    )
    if created_at:
        ev.created_at = created_at
    db.add(ev)
    return ev


def set_status(db: Session, incident: Incident, status: str) -> None:
    incident.status = status
    if status == "RESOLVED":
        incident.resolved_at = datetime.utcnow()
    elif incident.resolved_at:
        incident.resolved_at = None
