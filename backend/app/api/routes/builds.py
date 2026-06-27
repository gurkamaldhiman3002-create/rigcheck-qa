from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.build import InspectionStatus
from app.schemas.build import BuildCreate, BuildListResponse, BuildOut, BuildUpdate
from app.services.build_service import (
    create_build,
    delete_build,
    get_build,
    list_builds,
    update_build,
)

router = APIRouter(prefix="/api/builds", tags=["builds"])


@router.post("", response_model=BuildOut, status_code=status.HTTP_201_CREATED)
async def create_build_endpoint(payload: BuildCreate, db: AsyncSession = Depends(get_db)) -> BuildOut:
    try:
        build = await create_build(db, payload)
    except IntegrityError as exc:
        await db.rollback()
        if "ix_computer_builds_serial_number" in str(exc.orig):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A build with this serial number already exists") from exc
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Build could not be saved") from exc

    return BuildOut.model_validate(build)


@router.get("", response_model=BuildListResponse)
async def list_builds_endpoint(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: InspectionStatus | None = Query(default=None),
    search: str | None = Query(default=None),
) -> BuildListResponse:
    builds, total = await list_builds(db, limit=limit, offset=offset, status=status, search=search)
    return BuildListResponse(
        items=[BuildOut.model_validate(build) for build in builds],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{build_id}", response_model=BuildOut)
async def get_build_endpoint(build_id: UUID, db: AsyncSession = Depends(get_db)) -> BuildOut:
    build = await get_build(db, build_id)
    if build is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Build not found")
    return BuildOut.model_validate(build)


@router.patch("/{build_id}", response_model=BuildOut)
async def update_build_endpoint(build_id: UUID, payload: BuildUpdate, db: AsyncSession = Depends(get_db)) -> BuildOut:
    build = await get_build(db, build_id)
    if build is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Build not found")

    try:
        updated_build = await update_build(db, build, payload)
    except IntegrityError as exc:
        await db.rollback()
        if "ix_computer_builds_serial_number" in str(exc.orig):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A build with this serial number already exists") from exc
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Build could not be updated") from exc

    return BuildOut.model_validate(updated_build)


@router.delete("/{build_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_build_endpoint(build_id: UUID, db: AsyncSession = Depends(get_db)) -> None:
    build = await get_build(db, build_id)
    if build is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Build not found")
    await delete_build(db, build)
