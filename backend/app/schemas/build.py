from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

from app.models.build import InspectionStatus

NonEmptyStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class BuildCreate(BaseModel):
    serial_number: NonEmptyStr
    asset_tag: str | None = None
    manufacturer: NonEmptyStr
    model_name: NonEmptyStr
    cpu: NonEmptyStr
    gpu: NonEmptyStr
    ram_gb: int = Field(gt=0)
    storage_gb: int = Field(gt=0)
    operating_system: str | None = None
    inspection_status: InspectionStatus = InspectionStatus.pending
    inspector_name: NonEmptyStr
    notes: str | None = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("serial_number")
    @classmethod
    def normalize_serial(cls, value: str) -> str:
        return value.strip()


class BuildUpdate(BaseModel):
    serial_number: str | None = None
    asset_tag: str | None = None
    manufacturer: str | None = None
    model_name: str | None = None
    cpu: str | None = None
    gpu: str | None = None
    ram_gb: int | None = Field(default=None, gt=0)
    storage_gb: int | None = Field(default=None, gt=0)
    operating_system: str | None = None
    inspection_status: InspectionStatus | None = None
    inspector_name: str | None = None
    notes: str | None = None

    model_config = ConfigDict(extra="forbid")


class BuildOut(BaseModel):
    id: uuid.UUID
    serial_number: str
    asset_tag: str | None
    manufacturer: str
    model_name: str
    cpu: str
    gpu: str
    ram_gb: int
    storage_gb: int
    operating_system: str | None
    inspection_status: InspectionStatus
    inspector_name: str
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BuildListResponse(BaseModel):
    items: list[BuildOut]
    total: int
    limit: int
    offset: int
