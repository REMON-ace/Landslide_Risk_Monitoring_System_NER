"""
Offline sync router — batch field report sync with deduplication.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.schemas import SyncFieldReportsIn, SyncFieldReportsOut
from app.services import reports_service

router = APIRouter()


@router.post("/sync/field-reports", response_model=SyncFieldReportsOut)
def sync_field_reports(body: SyncFieldReportsIn, db: Session = Depends(get_db)):
    items = [r.model_dump() for r in body.reports]
    result = reports_service.sync_reports(db, items)
    return result
