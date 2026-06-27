from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.defect import DefectCreate, DefectOut, DefectUpdate
from app.services.build_service import create_defect, delete_defect, get_build, list_defects, update_defect

router = APIRouter(tags=["defects"])


@router.post("/api/builds/{build_id}/defects", response_model=DefectOut, status_code=status.HTTP_201_CREATED)
async def create_defect_endpoint(build_id: UUID, payload: DefectCreate, db: AsyncSession = Depends(get_db)) -> DefectOut:
    build = await get_build(db, build_id)
    if build is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Build not found")
    defect = await create_defect(db, build, payload)
    return DefectOut.model_validate(defect)


@router.get("/api/builds/{build_id}/defects", response_model=list[DefectOut])
async def list_defects_endpoint(build_id: UUID, db: AsyncSession = Depends(get_db)) -> list[DefectOut]:
    build = await get_build(db, build_id)
    if build is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Build not found")
    defects = await list_defects(db, build_id)
    return [DefectOut.model_validate(defect) for defect in defects]


@router.patch("/api/defects/{defect_id}", response_model=DefectOut)
async def update_defect_endpoint(defect_id: UUID, payload: DefectUpdate, db: AsyncSession = Depends(get_db)) -> DefectOut:
    from app.models.defect import Defect

    defect = await db.get(Defect, defect_id)
    if defect is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Defect not found")
    updated_defect = await update_defect(db, defect, payload)
    return DefectOut.model_validate(updated_defect)


@router.delete("/api/defects/{defect_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_defect_endpoint(defect_id: UUID, db: AsyncSession = Depends(get_db)) -> None:
    from app.models.defect import Defect

    defect = await db.get(Defect, defect_id)
    if defect is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Defect not found")
    await delete_defect(db, defect)
