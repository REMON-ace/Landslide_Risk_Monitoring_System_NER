"""
Dashboard aggregation service — single call for the main dashboard view.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import Zone, Road, Alert, FieldReport, RoadStatusEnum, SeverityEnum


def get_dashboard_summary(db: Session, district: Optional[str] = None) -> dict:
    zone_q = db.query(Zone)
    if district:
        zone_q = zone_q.filter(func.lower(Zone.district) == district.lower())

    total_zones = zone_q.count()

    high_risk = zone_q.filter(
        Zone.current_severity.in_([SeverityEnum.high, SeverityEnum.critical])
    ).count()

    # Roads blocked (filtered by district if provided)
    road_q = db.query(Road).filter(Road.status == RoadStatusEnum.blocked)
    if district:
        road_q = road_q.filter(func.lower(Road.district) == district.lower())
    roads_blocked = road_q.count()

    # Active alerts (last 24h)
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    alert_q = db.query(Alert)
    if district:
        alert_q = alert_q.join(Zone, Alert.zone_id == Zone.id).filter(
            func.lower(Zone.district) == district.lower()
        )
    active_alerts = alert_q.filter(Alert.sent_at >= cutoff).count()

    # Field reports last 24h
    reports_last_24h = db.query(FieldReport).filter(
        FieldReport.submitted_at >= cutoff
    ).count()

    # Top priority zones (top 5 by risk score)
    top_zones = (
        zone_q.order_by(Zone.current_risk_score.desc())
        .limit(5)
        .all()
    )

    top_priority_zones = [
        {"zone_id": z.zone_id, "village_name": z.village_name, "risk_score": z.current_risk_score}
        for z in top_zones
    ]

    return {
        "total_zones_monitored": total_zones,
        "high_risk_zones": high_risk,
        "roads_blocked": roads_blocked,
        "active_alerts": active_alerts,
        "reports_last_24h": reports_last_24h,
        "top_priority_zones": top_priority_zones,
    }
