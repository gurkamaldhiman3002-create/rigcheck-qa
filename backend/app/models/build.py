from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum as PyEnum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.defect import Defect


class InspectionStatus(str, PyEnum):
    pending = "pending"
    passed = "passed"
    failed = "failed"
    rework = "rework"


class Build(Base):
    __tablename__ = "computer_builds"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4, index=True)
    serial_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    asset_tag: Mapped[str | None] = mapped_column(String(100), nullable=True)
    manufacturer: Mapped[str] = mapped_column(String(255), nullable=False)
    model_name: Mapped[str] = mapped_column(String(255), nullable=False)
    cpu: Mapped[str] = mapped_column(String(255), nullable=False)
    gpu: Mapped[str] = mapped_column(String(255), nullable=False)
    ram_gb: Mapped[int] = mapped_column(Integer, nullable=False)
    storage_gb: Mapped[int] = mapped_column(Integer, nullable=False)
    operating_system: Mapped[str | None] = mapped_column(String(255), nullable=True)
    inspection_status: Mapped[InspectionStatus] = mapped_column(
        SAEnum(InspectionStatus, native_enum=False, length=20),
        nullable=False,
        default=InspectionStatus.pending,
    )
    inspector_name: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    defects: Mapped[list["Defect"]] = relationship(back_populates="build", cascade="all, delete-orphan")
