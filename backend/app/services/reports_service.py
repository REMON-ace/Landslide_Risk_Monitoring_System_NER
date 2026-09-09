"""
Field reports service — create, list, update, offline sync.
"""
from __future__ import annotations

import os
import uuid
import shutil
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func

from geoalchemy2.functions import ST_X, ST_Y
from app.models.models import FieldReport, ReportStatusEnum, ReporterTypeEnum, Zone
from app.core.config import settings


def _next_report_id(db: Session) -> str:
    count = db.query(func.count(FieldReport.id)).scalar() or 0
    return f"FR-{1000 + count + 1}"


def save_photo(file: UploadFile, report_id: str) -> str:
    """Save uploaded photo to UPLOAD_DIR and return its public URL."""
    os.makedirs(settings.upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "photo.jpg")[1] or ".jpg"
    filename = f"{report_id}{ext}"
    path = os.path.join(settings.upload_dir, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return f"{settings.base_url}/uploads/{filename}"


def create_report(
    db: Session,
    lat: float,
    lng: float,
    description: Optional[str],
    photo_url: Optional[str],
    reporter_type: str,
    language: str,
    client_report_id: Optional[str],
    timestamp: Optional[datetime],
) -> FieldReport:
    report_id = _next_report_id(db)
    report = FieldReport(
        report_id=report_id,
        client_report_id=client_report_id,
        lat=lat,
        lng=lng,
        description=description,
        photo_url=photo_url,
        reporter_type=ReporterTypeEnum(reporter_type) if reporter_type else ReporterTypeEnum.citizen,
        language=language or "en",
        status=ReportStatusEnum.received,
        submitted_at=timestamp or datetime.now(timezone.utc),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_reports(
    db: Session,
    status: Optional[str] = None,
    zone_id: Optional[str] = None,
    since: Optional[datetime] = None,
) -> List[dict]:
    q = db.query(FieldReport)
    if status:
        try:
            status_enum = ReportStatusEnum(status)
            q = q.filter(FieldReport.status == status_enum)
        except ValueError:
            return []
    if since:
        q = q.filter(FieldReport.submitted_at >= since)
    if zone_id:
        zone_coords = (
            db.query(ST_X(Zone.geometry).label("lng"), ST_Y(Zone.geometry).label("lat"))
            .filter(Zone.zone_id == zone_id)
            .first()
        )
        if zone_coords:
            z_lng, z_lat = zone_coords
            # Approximate spatial filter: reports within ~15 km (~0.15 deg)
            q = q.filter(
                FieldReport.lat.between(z_lat - 0.15, z_lat + 0.15),
                FieldReport.lng.between(z_lng - 0.15, z_lng + 0.15),
            )
        else:
            return []
    reports = q.order_by(FieldReport.submitted_at.desc()).all()
    return [_report_to_dict(r) for r in reports]


def patch_report(db: Session, report_id: str, status: str) -> Optional[dict]:
    report = db.query(FieldReport).filter(FieldReport.report_id == report_id).first()
    if not report:
        return None
    report.status = ReportStatusEnum(status)
    db.commit()
    db.refresh(report)
    return _report_to_dict(report)


def _report_to_dict(r: FieldReport) -> dict:
    return {
        "report_id": r.report_id,
        "lat": r.lat,
        "lng": r.lng,
        "description": r.description,
        "photo_url": r.photo_url,
        "status": r.status.value if r.status else "received",
        "reporter_type": r.reporter_type.value if r.reporter_type else "citizen",
        "timestamp": r.submitted_at,
    }


def sync_reports(db: Session, items: List[dict]) -> dict:
    synced = []
    failed = []
    for item in items:
        client_id = item.get("client_report_id")
        if not client_id:
            failed.append(client_id or "unknown")
            continue
        # Dedup check
        existing = db.query(FieldReport).filter(
            FieldReport.client_report_id == client_id
        ).first()
        if existing:
            synced.append(client_id)
            continue
        try:
            ts_raw = item.get("timestamp")
            ts = ts_raw if isinstance(ts_raw, datetime) else (
                datetime.fromisoformat(str(ts_raw).replace("Z", "+00:00")) if ts_raw else datetime.now(timezone.utc)
            )
            create_report(
                db=db,
                lat=item["lat"],
                lng=item["lng"],
                description=item.get("description"),
                photo_url=None,
                reporter_type=item.get("reporter_type", "citizen"),
                language=item.get("language", "en"),
                client_report_id=client_id,
                timestamp=ts,
            )
            synced.append(client_id)
        except Exception as e:
            print(f"[SYNC ERROR] {client_id}: {e}")
            db.rollback()
            failed.append(client_id)
    return {"synced": synced, "failed": failed}
