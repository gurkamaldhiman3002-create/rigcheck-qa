from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.build import Build, InspectionStatus
from app.models.defect import Defect, DefectStatus
from app.schemas.build import BuildCreate, BuildUpdate
from app.schemas.defect import DefectCreate, DefectUpdate


async def create_build(session: AsyncSession, payload: BuildCreate) -> Build:
    build = Build(**payload.model_dump())
    session.add(build)
    await session.commit()
    await session.refresh(build)
    return build


async def list_builds(
    session: AsyncSession,
    *,
    limit: int,
    offset: int,
    status: InspectionStatus | None = None,
    search: str | None = None,
) -> tuple[list[Build], int]:
    statement = select(Build).options(selectinload(Build.defects))
    count_statement = select(func.count(Build.id))

    if status is not None:
        statement = statement.where(Build.inspection_status == status)
        count_statement = count_statement.where(Build.inspection_status == status)

    if search:
        like_value = f"%{search}%"
        search_filter = or_(
            Build.serial_number.ilike(like_value),
            Build.asset_tag.ilike(like_value),
            Build.manufacturer.ilike(like_value),
            Build.model_name.ilike(like_value),
        )
        statement = statement.where(search_filter)
        count_statement = count_statement.where(search_filter)

    statement = statement.order_by(Build.created_at.desc()).offset(offset).limit(limit)
    total_result = await session.execute(count_statement)
    result = await session.execute(statement)
    return list(result.scalars().all()), total_result.scalar_one()


async def get_build(session: AsyncSession, build_id: UUID) -> Build | None:
    statement = select(Build).options(selectinload(Build.defects)).where(Build.id == build_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def update_build(session: AsyncSession, build: Build, payload: BuildUpdate) -> Build:
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(build, field, value)
    session.add(build)
    await session.commit()
    await session.refresh(build)
    return build


async def delete_build(session: AsyncSession, build: Build) -> None:
    await session.delete(build)
    await session.commit()


async def create_defect(session: AsyncSession, build: Build, payload: DefectCreate) -> Defect:
    defect = Defect(build_id=build.id, **payload.model_dump())
    session.add(defect)
    await session.commit()
    await session.refresh(defect)
    return defect


async def list_defects(session: AsyncSession, build_id: UUID) -> list[Defect]:
    statement = select(Defect).where(Defect.build_id == build_id).order_by(Defect.created_at.desc())
    result = await session.execute(statement)
    return list(result.scalars().all())


async def update_defect(session: AsyncSession, defect: Defect, payload: DefectUpdate) -> Defect:
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(defect, field, value)
    session.add(defect)
    await session.commit()
    await session.refresh(defect)
    return defect


async def delete_defect(session: AsyncSession, defect: Defect) -> None:
    await session.delete(defect)
    await session.commit()


async def get_dashboard_summary(session: AsyncSession) -> dict[str, int | float]:
    total_builds_result = await session.execute(select(func.count(Build.id)))
    pending_result = await session.execute(select(func.count(Build.id)).where(Build.inspection_status == InspectionStatus.pending))
    passed_result = await session.execute(select(func.count(Build.id)).where(Build.inspection_status == InspectionStatus.passed))
    failed_result = await session.execute(select(func.count(Build.id)).where(Build.inspection_status == InspectionStatus.failed))
    rework_result = await session.execute(select(func.count(Build.id)).where(Build.inspection_status == InspectionStatus.rework))
    open_defects_result = await session.execute(select(func.count(Defect.id)).where(Defect.status == DefectStatus.open))

    total_builds = total_builds_result.scalar_one()
    pending_count = pending_result.scalar_one()
    passed_count = passed_result.scalar_one()
    failed_count = failed_result.scalar_one()
    rework_count = rework_result.scalar_one()
    open_defects_count = open_defects_result.scalar_one()
    pass_rate = round((passed_count / total_builds) * 100, 2) if total_builds else 0.0

    return {
        "total_builds": total_builds,
        "pending_inspections": pending_count,
        "passed_inspections": passed_count,
        "failed_inspections": failed_count,
        "builds_in_rework": rework_count,
        "open_defects": open_defects_count,
        "pass_rate": pass_rate,
    }
