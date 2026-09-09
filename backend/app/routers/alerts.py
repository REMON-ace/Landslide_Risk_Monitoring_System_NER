"""
Alerts router — GET list, POST create (auth required).
"""
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.schemas import AlertOut, AlertCreateIn, AlertCreatedOut
from app.services import alerts_service
from app.core.security import require_admin

router = APIRouter()


@router.get("/alerts", response_model=List[AlertOut])
def list_alerts(
    village_id: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return alerts_service.get_alerts(db, village_id=village_id, severity=severity)


@router.post("/alerts", response_model=AlertCreatedOut, status_code=201)
def create_alert(
    body: AlertCreateIn,
    db: Session = Depends(get_db),
    _user=Depends(require_admin),
):
    allowed_severities = ("low", "medium", "high", "critical")
    if body.severity not in allowed_severities:
        raise HTTPException(status_code=422, detail=f"severity must be one of {allowed_severities}")
    try:
        result = alerts_service.create_alert(db, body.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return result
