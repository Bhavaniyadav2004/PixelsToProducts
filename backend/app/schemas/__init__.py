from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

from ..constants import ISSUE_TYPES, SEVERITIES

IssueType = Literal[tuple(ISSUE_TYPES)]  # type: ignore[valid-type]
Severity = Literal[tuple(SEVERITIES)]  # type: ignore[valid-type]


class LoginIn(BaseModel):
    email: str
    password: str


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department_id: int | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: Literal["CITIZEN", "MUNICIPAL_MEMBER", "ADMIN"]
    department_id: int | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    role: Literal["CITIZEN", "MUNICIPAL_MEMBER", "ADMIN"] | None = None
    department_id: int | None = None


class AIAnalysisResult(BaseModel):
    issue_type: str
    severity: str
    confidence: float = Field(ge=0, le=1)
    description: str = ""

    @field_validator("issue_type")
    @classmethod
    def _type(cls, v: str) -> str:
        v = v.strip().upper().replace(" ", "_")
        return v if v in ISSUE_TYPES else "OTHER"

    @field_validator("severity")
    @classmethod
    def _sev(cls, v: str) -> str:
        v = v.strip().upper()
        return v if v in SEVERITIES else "MEDIUM"


class AIVerificationResult(BaseModel):
    improvement_detected: bool
    remaining_damage: bool
    confidence: float = Field(ge=0, le=1)
    summary: str = ""


class ReportCreate(BaseModel):
    description: str | None = None
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    street_name: str | None = None
    issue_type: IssueType
    severity: Severity
    media_ids: list[int] = Field(min_length=1)


class CitizenVerificationIn(BaseModel):
    confirmed: bool
    notes: str | None = None


class AssignIn(BaseModel):
    department_id: int | None = None
    user_id: int
    due_date: datetime | None = None


class IncidentPatch(BaseModel):
    priority_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] | None = None
    unlock_priority: bool = False
    status: Literal["NEW", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "REQUIRES_REVIEW", "RESOLVED"] | None = None
    note: str | None = None


class WorkAction(BaseModel):
    action: Literal["accept", "start", "note", "complete"]
    notes: str | None = None
