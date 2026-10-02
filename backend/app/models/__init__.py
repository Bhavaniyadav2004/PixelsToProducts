from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


def utcnow() -> datetime:
    return datetime.utcnow()


class Department(Base):
    __tablename__ = "departments"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str | None] = mapped_column(Text, default=None)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(300))
    role: Mapped[str] = mapped_column(String(30), default="CITIZEN")
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    department: Mapped[Department | None] = relationship()


class Incident(Base):
    __tablename__ = "incidents"
    id: Mapped[int] = mapped_column(primary_key=True)
    incident_code: Mapped[str | None] = mapped_column(String(20), unique=True, index=True, default=None)
    issue_type: Mapped[str] = mapped_column(String(30), index=True)
    severity: Mapped[str] = mapped_column(String(10))
    initial_severity: Mapped[str] = mapped_column(String(10))
    priority_score: Mapped[float] = mapped_column(Float, default=0)
    priority_level: Mapped[str] = mapped_column(String(10), default="LOW")
    priority_locked: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(30), default="NEW", index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    street_name: Mapped[str] = mapped_column(String(200))
    street_slug: Mapped[str] = mapped_column(String(200), index=True)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    assigned_department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), default=None)
    assigned_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), default=None)
    due_date: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    first_reported_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    last_reported_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    department: Mapped[Department | None] = relationship()
    assigned_user: Mapped[User | None] = relationship(foreign_keys=[assigned_user_id])
    reports: Mapped[list["Report"]] = relationship(back_populates="incident", order_by="Report.created_at")
    media: Mapped[list["Media"]] = relationship(back_populates="incident", order_by="Media.created_at")
    events: Mapped[list["TimelineEvent"]] = relationship(back_populates="incident", order_by="TimelineEvent.created_at")
    repair_updates: Mapped[list["RepairUpdate"]] = relationship(order_by="RepairUpdate.created_at")
    verifications: Mapped[list["Verification"]] = relationship(order_by="Verification.created_at")


class Report(Base):
    __tablename__ = "reports"
    id: Mapped[int] = mapped_column(primary_key=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    incident: Mapped[Incident] = relationship(back_populates="reports")
    user: Mapped[User] = relationship()
    media: Mapped[list["Media"]] = relationship(back_populates="report")


class Media(Base):
    __tablename__ = "media"
    id: Mapped[int] = mapped_column(primary_key=True)
    incident_id: Mapped[int | None] = mapped_column(ForeignKey("incidents.id"), index=True, default=None)
    report_id: Mapped[int | None] = mapped_column(ForeignKey("reports.id"), default=None)
    uploaded_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    media_type: Mapped[str] = mapped_column(String(10))  # image | video
    media_role: Mapped[str] = mapped_column(String(20), default="CITIZEN_REPORT")
    cloudinary_public_id: Mapped[str] = mapped_column(String(300))
    cloudinary_url: Mapped[str] = mapped_column(String(600))
    thumbnail_url: Mapped[str | None] = mapped_column(String(600), default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    incident: Mapped[Incident | None] = relationship(back_populates="media")
    report: Mapped[Report | None] = relationship(back_populates="media")
    analyses: Mapped[list["AIAnalysis"]] = relationship(order_by="AIAnalysis.created_at")


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"
    id: Mapped[int] = mapped_column(primary_key=True)
    media_id: Mapped[int] = mapped_column(ForeignKey("media.id"), index=True)
    issue_type: Mapped[str] = mapped_column(String(30))
    severity: Mapped[str] = mapped_column(String(10))
    confidence: Mapped[float] = mapped_column(Float)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    raw_response: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class RepairUpdate(Base):
    __tablename__ = "repair_updates"
    id: Mapped[int] = mapped_column(primary_key=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"), index=True)
    updated_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(30))
    notes: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    user: Mapped[User] = relationship()


class Verification(Base):
    __tablename__ = "verifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"), index=True)
    ai_result: Mapped[str] = mapped_column(String(20))
    ai_confidence: Mapped[float] = mapped_column(Float, default=0)
    ai_summary: Mapped[str | None] = mapped_column(Text, default=None)
    citizen_result: Mapped[str | None] = mapped_column(String(10), default=None)  # YES | NO
    final_status: Mapped[str] = mapped_column(String(30), default="PENDING")
    notes: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"), index=True)
    event_type: Mapped[str] = mapped_column(String(30))
    title: Mapped[str] = mapped_column(String(200))
    detail: Mapped[str | None] = mapped_column(Text, default=None)
    media_url: Mapped[str | None] = mapped_column(String(600), default=None)
    thumbnail_url: Mapped[str | None] = mapped_column(String(600), default=None)
    media_type: Mapped[str | None] = mapped_column(String(10), default=None)
    actor_name: Mapped[str | None] = mapped_column(String(100), default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    incident: Mapped[Incident] = relationship(back_populates="events")
