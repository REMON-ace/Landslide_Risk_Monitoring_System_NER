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
from app.models.models import FieldReport, ReportStatusEnum, ReporterTypeEnum, SeverityEnum, Zone, Alert, RiskHistory
from app.core.config import settings
from app.db.session import engine


def _next_report_id(db: Session) -> str:
    count = db.query(func.count(FieldReport.id)).scalar() or 0
    return f"FR-{1000 + count + 1}"


try:
    import cloudinary
    import cloudinary.uploader
    from cloudinary.utils import cloudinary_url

    if settings.cloudinary_cloud_name:
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True,
        )
    HAS_CLOUDINARY = True
except Exception:
    HAS_CLOUDINARY = False

def save_photo(file: UploadFile, report_id: str) -> str:
    """Save uploaded photo to Cloudinary (or local disk fallback) and return public URL."""
    if HAS_CLOUDINARY and settings.cloudinary_cloud_name:
        try:
            upload_result = cloudinary.uploader.upload(
                file.file,
                public_id=f"landslide_reports/{report_id}",
                overwrite=True
            )
            if upload_result.get("secure_url"):
                return upload_result.get("secure_url")
        except Exception as e:
            print(f"[NOTE] Cloudinary upload failed, using local storage: {e}")

    # Local storage fallback
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
    severity: Optional[str] = "medium",
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
        severity=SeverityEnum(severity) if severity else SeverityEnum.medium,
        submitted_at=timestamp or datetime.now(timezone.utc),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Automatically create a corresponding Alert in the database so posted reports show in Alerts
    try:
        first_zone = db.query(Zone).first()
        if first_zone:
            alert_id = f"AL-{report_id.replace('FR-', '')}"
            msg = description if description else f"Field hazard report submitted near ({lat:.4f}, {lng:.4f})."
            alert = Alert(
                alert_id=alert_id,
                zone_id=first_zone.id,
                severity=SeverityEnum(severity) if severity else SeverityEnum.medium,
                message=msg,
                description=description,
                language=language or "en",
                channels=["app", "field_report"],
                sent_at=timestamp or datetime.now(timezone.utc),
                recipients_count=150,
                lat=lat,
                lng=lng,
            )
            db.add(alert)
            db.commit()
    except Exception as e:
        print(f"[NOTE] Auto alert creation skipped for {report_id}: {e}")

    return report


def get_reports(
    db: Session,
    status: Optional[str] = None,
    zone_id: Optional[str] = None,
    since: Optional[datetime] = None,
) -> List[dict]:
    q = db.query(FieldReport)
    # By default, exclude archived (soft-deleted) reports from the review queue
    if status:
        try:
            status_enum = ReportStatusEnum(status)
            q = q.filter(FieldReport.status == status_enum)
        except ValueError:
            return []
    else:
        # No explicit status filter — hide archived
        q = q.filter(FieldReport.status != ReportStatusEnum.archived)
    if since:
        q = q.filter(FieldReport.submitted_at >= since)

    if zone_id:
        if engine.dialect.name == "sqlite":
            zone = db.query(Zone).filter(Zone.zone_id == zone_id).first()
            if zone and zone.geometry and "POINT(" in str(zone.geometry):
                try:
                    coords = str(zone.geometry).replace("POINT(", "").replace(")", "").strip().split()
                    z_lng, z_lat = float(coords[0]), float(coords[1])
                    q = q.filter(
                        FieldReport.lat.between(z_lat - 0.15, z_lat + 0.15),
                        FieldReport.lng.between(z_lng - 0.15, z_lng + 0.15),
                    )
                except Exception:
                    return []
            else:
                return []
        else:
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


def _find_nearest_zone(db: Session, lat: float, lng: float) -> Optional[Zone]:
    """Find the nearest Zone to the given coordinates."""
    if engine.dialect.name == "sqlite":
        candidates = db.query(Zone).all()
        best_zone = None
        best_dist = float("inf")
        for z in candidates:
            if z.geometry and "POINT(" in str(z.geometry):
                try:
                    coords = str(z.geometry).replace("POINT(", "").replace(")", "").strip().split()
                    z_lng, z_lat = float(coords[0]), float(coords[1])
                    dist = ((z_lat - lat) ** 2 + (z_lng - lng) ** 2) ** 0.5
                    if dist < best_dist:
                        best_dist = dist
                        best_zone = z
                except Exception:
                    pass
        if best_zone:
            return best_zone
        return candidates[0] if candidates else None
    else:
        from geoalchemy2.functions import ST_X as _stx, ST_Y as _sty
        candidates = (
            db.query(
                Zone,
                _stx(Zone.geometry).label("z_lng"),
                _sty(Zone.geometry).label("z_lat"),
            )
            .all()
        )
        best_zone = None
        best_dist = float("inf")
        for z, z_lng, z_lat in candidates:
            if z_lng is not None and z_lat is not None:
                dist = ((z_lat - lat) ** 2 + (z_lng - lng) ** 2) ** 0.5
                if dist < best_dist:
                    best_dist = dist
                    best_zone = z
        if best_zone:
            return best_zone
        return candidates[0][0] if candidates else None


# Severity-based risk score increments applied when a report is verified
_VERIFICATION_RISK_BOOST = {
    "low": 0.05,
    "medium": 0.10,
    "high": 0.15,
    "critical": 0.20,
}


def _apply_verified_report_to_zone(db: Session, report: FieldReport) -> Optional[dict]:
    """
    When a field report is verified by admin, boost the nearest zone's risk
    score and update the corresponding alert's map coordinates.
    """
    from app.services.risk_service import score_to_severity

    nearest_zone = _find_nearest_zone(db, report.lat, report.lng)
    if not nearest_zone:
        print(f"[NOTE] No zone found near report {report.report_id} ({report.lat}, {report.lng})")
        return None

    # 1. Boost zone risk score
    sev_key = report.severity.value if hasattr(report.severity, "value") else str(report.severity)
    boost = _VERIFICATION_RISK_BOOST.get(sev_key, 0.10)
    old_score = nearest_zone.current_risk_score or 0.0
    new_score = round(min(old_score + boost, 1.0), 4)
    nearest_zone.current_risk_score = new_score
    nearest_zone.current_severity = SeverityEnum(score_to_severity(new_score))
    nearest_zone.last_updated = datetime.now(timezone.utc)

    # 2. Record in risk history
    history_entry = RiskHistory(
        zone_id=nearest_zone.id,
        risk_score=new_score,
        recorded_at=datetime.now(timezone.utc),
    )
    db.add(history_entry)

    # 3. Update the auto-created Alert to have report lat/lng + correct zone
    try:
        alert_id = f"AL-{report.report_id.replace('FR-', '')}"
        alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
        if alert:
            alert.lat = report.lat
            alert.lng = report.lng
            alert.zone_id = nearest_zone.id
    except Exception as e:
        print(f"[NOTE] Alert coordinate update skipped for {report.report_id}: {e}")

    print(f"[VERIFIED] Report {report.report_id} → zone {nearest_zone.zone_id} "
          f"risk {old_score:.2f} → {new_score:.2f} ({nearest_zone.current_severity.value})")

    return {
        "zone_id": nearest_zone.zone_id,
        "village_name": nearest_zone.village_name,
        "previous_score": old_score,
        "new_score": new_score,
        "severity": nearest_zone.current_severity.value,
    }


def patch_report(db: Session, report_id: str, status: Optional[str] = None, severity: Optional[str] = None) -> Optional[dict]:
    report = db.query(FieldReport).filter(FieldReport.report_id == report_id).first()
    if not report:
        return None
    if status:
        report.status = ReportStatusEnum(status)
    if severity:
        report.severity = SeverityEnum(severity)
        # Also sync severity to corresponding auto-created Alert if present
        try:
            alert_id = f"AL-{report_id.replace('FR-', '')}"
            alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
            if alert:
                alert.severity = SeverityEnum(severity)
        except Exception as e:
            print(f"[NOTE] Failed to sync alert severity for {report_id}: {e}")

    # When a report is verified, update the nearest zone's risk score and map data
    if status == "verified":
        try:
            _apply_verified_report_to_zone(db, report)
        except Exception as e:
            print(f"[NOTE] Risk zone update failed for {report_id}: {e}")

    db.commit()
    db.refresh(report)
    return _report_to_dict(report)


def _get_enum_val(val, default: str) -> str:
    if not val:
        return default
    return val.value if hasattr(val, "value") else str(val)


def _report_to_dict(r: FieldReport) -> dict:
    return {
        "report_id": r.report_id,
        "lat": r.lat,
        "lng": r.lng,
        "description": r.description,
        "photo_url": r.photo_url,
        "status": _get_enum_val(r.status, "received"),
        "severity": _get_enum_val(r.severity, "medium"),
        "reporter_type": _get_enum_val(r.reporter_type, "citizen"),
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


def delete_report(db: Session, report_id: str) -> bool:
    report = db.query(FieldReport).filter(FieldReport.report_id == report_id).first()
    if not report:
        return False

    try:
        # Also clean up matching alert record if one was created
        alt_id = f"AL-{report_id.replace('FR-', '')}"
        db.query(Alert).filter(Alert.alert_id.in_([report_id, alt_id])).delete(synchronize_session=False)
    except Exception:
        pass

    db.delete(report)
    db.commit()
    return True
