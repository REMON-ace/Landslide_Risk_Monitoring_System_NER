"""
Risk & prediction router.
"""
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.schemas import RiskZoneOut, PredictRiskIn, PredictRiskOut, RiskHistoryOut
from app.services import risk_service
from app.services.risk_model import ModelUnavailableError, predict_risk as ml_predict
from app.core.config import settings

router = APIRouter()


@router.get("/risk-zones", response_model=List[RiskZoneOut])
def list_risk_zones(
    district: Optional[str] = None,
    min_severity: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return risk_service.get_all_zones(db, district=district, min_severity=min_severity)


@router.post("/predict-risk", response_model=PredictRiskOut)
def predict_risk(payload: PredictRiskIn):
    """
    Run the trained landslide risk model and return a probability score + severity label.
    """
    try:
        result = ml_predict(
            payload.model_dump(),
            allow_empirical_fallback=settings.allow_empirical_fallback,
            model_version=settings.model_version,
        )
    except ModelUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    return result


@router.get("/risk-zones/{zone_id}/history", response_model=RiskHistoryOut)
def zone_history(zone_id: str, db: Session = Depends(get_db)):
    result = risk_service.get_zone_history(db, zone_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found")
    return result

