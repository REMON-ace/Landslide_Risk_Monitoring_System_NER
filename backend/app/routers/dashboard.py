"""
Dashboard router — single aggregate endpoint.
"""
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.schemas import DashboardSummaryOut
from app.services import dashboard_service

router = APIRouter()


@router.get("/dashboard/summary", response_model=DashboardSummaryOut)
def dashboard_summary(
    district: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return dashboard_service.get_dashboard_summary(db, district=district)
