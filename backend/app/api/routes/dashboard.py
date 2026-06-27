from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.defect import DashboardSummary
from app.services.build_service import get_dashboard_summary

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary_endpoint(db: AsyncSession = Depends(get_db)) -> DashboardSummary:
    summary = await get_dashboard_summary(db)
    return DashboardSummary(**summary)
