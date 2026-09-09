"""
Field reports router — POST (multipart), GET, PATCH.
"""
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.schemas import FieldReportOut, FieldReportCreatedOut, FieldReportPatchIn
from app.services import reports_service
from app.core.security import require_admin

router = APIRouter()


@router.post("/field-reports", response_model=FieldReportCreatedOut, status_code=201)
async def create_field_report(
    lat: float = Form(...),
    lng: float = Form(...),
    description: Optional[str] = Form(None),
    reporter_type: str = Form("citizen"),
    language: str = Form("en"),
    client_report_id: Optional[str] = Form(None),
    timestamp: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Parse timestamp
    ts: Optional[datetime] = None
    if timestamp:
        try:
            ts = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        except ValueError:
            pass

    # Save photo if provided
    photo_url: Optional[str] = None
    if photo and photo.filename:
        # Temporary ID for naming — will be replaced after report creation
        import uuid
        temp_id = f"FR-TEMP-{uuid.uuid4().hex[:8]}"
        photo_url = reports_service.save_photo(photo, temp_id)

    report = reports_service.create_report(
        db=db,
        lat=lat,
        lng=lng,
        description=description,
        photo_url=photo_url,
        reporter_type=reporter_type,
        language=language,
        client_report_id=client_report_id,
        timestamp=ts,
    )
    return {
        "report_id": report.report_id,
        "status": report.status.value,
        "photo_url": report.photo_url,
    }


@router.get("/field-reports", response_model=List[FieldReportOut])
def list_field_reports(
    status: Optional[str] = None,
    zone_id: Optional[str] = None,
    since: Optional[str] = None,
    db: Session = Depends(get_db),
):
    since_dt: Optional[datetime] = None
    if since:
        try:
            since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid 'since' datetime format")
    return reports_service.get_reports(db, status=status, zone_id=zone_id, since=since_dt)


@router.patch("/field-reports/{report_id}", status_code=200)
def patch_field_report(
    report_id: str,
    body: FieldReportPatchIn,
    db: Session = Depends(get_db),
    _user=Depends(require_admin),
):
    allowed = ("received", "verified", "dismissed")
    if body.status not in allowed:
        raise HTTPException(status_code=422, detail=f"status must be one of {allowed}")
    result = reports_service.patch_report(db, report_id=report_id, status=body.status)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found")
    return result
