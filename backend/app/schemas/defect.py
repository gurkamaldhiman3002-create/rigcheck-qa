from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.models.defect import DefectCategory, DefectSeverity, DefectStatus

NonEmptyStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class DefectCreate(BaseModel):
    defect_category: DefectCategory
    severity: DefectSeverity
    description: NonEmptyStr
    resolution_notes: str | None = None
    status: DefectStatus = DefectStatus.open

    model_config = ConfigDict(extra="forbid")


class DefectUpdate(BaseModel):
    defect_category: DefectCategory | None = None
    severity: DefectSeverity | None = None
    description: str | None = None
    resolution_notes: str | None = None
    status: DefectStatus | None = None

    model_config = ConfigDict(extra="forbid")


class DefectOut(BaseModel):
    id: uuid.UUID
    build_id: uuid.UUID
    defect_category: DefectCategory
    severity: DefectSeverity
    description: str
    resolution_notes: str | None
    status: DefectStatus
    created_at: datetime
    resolved_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class DashboardSummary(BaseModel):
    total_builds: int
    pending_inspections: int
    passed_inspections: int
    failed_inspections: int
    builds_in_rework: int
    open_defects: int
    pass_rate: float
