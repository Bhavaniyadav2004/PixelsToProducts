from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Department, User
from ..schemas import LoginIn, RegisterIn, UserOut
from ..utils.security import create_token, hash_password, verify_password
from .deps import get_current_user

router = APIRouter(prefix="/api", tags=["auth"])


def _auth_response(user: User) -> dict:
    return {"access_token": create_token(user.id, user.role), "token_type": "bearer", "user": UserOut.model_validate(user)}


@router.post("/auth/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.scalars(select(User).where(User.email == body.email.lower().strip())).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return _auth_response(user)


@router.post("/auth/register")
def register(body: RegisterIn, db: Session = Depends(get_db)):
    email = body.email.lower()
    if db.scalars(select(User).where(User.email == email)).first():
        raise HTTPException(409, "Email already registered")
    user = User(name=body.name, email=email, password_hash=hash_password(body.password), role="CITIZEN")
    db.add(user)
    db.commit()
    return _auth_response(user)


@router.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.get("/departments")
def departments(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return [{"id": d.id, "name": d.name, "description": d.description} for d in db.scalars(select(Department)).all()]
