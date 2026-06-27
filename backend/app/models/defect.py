from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum as PyEnum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.build import Build


class DefectCategory(str, PyEnum):
    wiring = "wiring"
    gpu = "gpu"
    cpu = "cpu"
    memory = "memory"
    storage = "storage"
    cooling = "cooling"
    cosmetic = "cosmetic"
    software = "software"
    other = "other"


class DefectSeverity(str, PyEnum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class DefectStatus(str, PyEnum):
    open = "open"
    in_rework = "in_rework"
    resolved = "resolved"


class Defect(Base):
    __tablename__ = "defects"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4, index=True)
    build_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("computer_builds.id", ondelete="CASCADE"), nullable=False, index=True)
    defect_category: Mapped[DefectCategory] = mapped_column(
        SAEnum(DefectCategory, native_enum=False, length=20),
        nullable=False,
    )
    severity: Mapped[DefectSeverity] = mapped_column(
        SAEnum(DefectSeverity, native_enum=False, length=20),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    resolution_notes: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    status: Mapped[DefectStatus] = mapped_column(
        SAEnum(DefectStatus, native_enum=False, length=20),
        nullable=False,
        default=DefectStatus.open,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    build: Mapped["Build"] = relationship(back_populates="defects")
