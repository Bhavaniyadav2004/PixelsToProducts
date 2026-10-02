import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Incident, User
from ..utils.security import decode_token

bearer = HTTPBearer(auto_error=False)


def get_current_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> User:
    if not creds:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = decode_token(creds.credentials)
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")
    user = db.get(User, int(payload["sub"]))
    if not user:
        raise HTTPException(401, "User not found")
    return user


def require_roles(*roles: str):
    def dep(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(403, "Insufficient permissions")
        return user
    return dep


def get_incident_or_404(db: Session, incident_id: int) -> Incident:
    inc = db.get(Incident, incident_id)
    if not inc:
        raise HTTPException(404, "Incident not found")
    return inc


def can_work(user: User, inc: Incident) -> bool:
    if user.role == "ADMIN":
        return True
    return user.role == "MUNICIPAL_MEMBER" and (
        inc.assigned_user_id == user.id
        or (user.department_id is not None and inc.assigned_department_id == user.department_id)
    )
