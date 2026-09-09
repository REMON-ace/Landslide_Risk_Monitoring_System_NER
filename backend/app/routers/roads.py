"""
GIS / infrastructure router — roads and villages.
"""
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.schemas import RoadOut, RoadPatchIn, VillageOut
from app.services import gis_service
from app.core.security import require_admin

router = APIRouter()


@router.get("/roads", response_model=List[RoadOut])
def list_roads(
    district: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return gis_service.get_roads(db, district=district, status=status)


@router.patch("/roads/{road_id}", response_model=RoadOut)
def update_road(
    road_id: str,
    body: RoadPatchIn,
    db: Session = Depends(get_db),
    _user=Depends(require_admin),
):
    allowed = ("clear", "partial", "blocked")
    if body.status not in allowed:
        raise HTTPException(status_code=422, detail=f"status must be one of {allowed}")
    result = gis_service.patch_road(db, road_id=road_id, status=body.status)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Road {road_id} not found")
    return result


@router.get("/villages", response_model=List[VillageOut])
def list_villages(db: Session = Depends(get_db)):
    return gis_service.get_villages(db)
