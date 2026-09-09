"""
Risk service — query zones, compute predictions (stub), history.
"""
from __future__ import annotations

import random
from datetime import datetime, timezone
from typing import List, Optional

from geoalchemy2.functions import ST_X, ST_Y
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import Zone, RiskHistory, SeverityEnum


SEVERITY_THRESHOLDS = [
    (0.75, "critical"),
    (0.5, "high"),
    (0.25, "medium"),
    (0.0, "low"),
]


def score_to_severity(score: float) -> str:
    for threshold, label in SEVERITY_THRESHOLDS:
        if score >= threshold:
            return label
    return "low"


from app.db.session import engine


def get_all_zones(
    db: Session,
    district: Optional[str] = None,
    min_severity: Optional[str] = None,
) -> List[dict]:
    if engine.dialect.name == "sqlite":
        q = db.query(Zone)
        if district:
            q = q.filter(func.lower(Zone.district) == district.lower())
        if min_severity:
            order = ["low", "medium", "high", "critical"]
            if min_severity in order:
                idx = order.index(min_severity)
                allowed = [SeverityEnum(s) for s in order[idx:]]
                q = q.filter(Zone.current_severity.in_(allowed))

        results = []
        for zone in q.all():
            lng, lat = 0.0, 0.0
            if zone.geometry and "POINT(" in str(zone.geometry):
                try:
                    coords = str(zone.geometry).replace("POINT(", "").replace(")", "").strip().split()
                    lng, lat = float(coords[0]), float(coords[1])
                except Exception:
                    pass
            results.append({
                "zone_id": zone.zone_id,
                "village_name": zone.village_name,
                "lat": lat,
                "lng": lng,
                "risk_score": zone.current_risk_score,
                "severity": zone.current_severity.value if zone.current_severity else "low",
                "last_updated": zone.last_updated,
            })
        return results

    q = db.query(
        Zone,
        ST_X(Zone.geometry).label("lng"),
        ST_Y(Zone.geometry).label("lat"),
    )
    if district:
        q = q.filter(func.lower(Zone.district) == district.lower())
    if min_severity:
        order = ["low", "medium", "high", "critical"]
        if min_severity in order:
            idx = order.index(min_severity)
            allowed = [SeverityEnum(s) for s in order[idx:]]
            q = q.filter(Zone.current_severity.in_(allowed))

    results = []
    for zone, lng, lat in q.all():
        results.append({
            "zone_id": zone.zone_id,
            "village_name": zone.village_name,
            "lat": lat,
            "lng": lng,
            "risk_score": zone.current_risk_score,
            "severity": zone.current_severity.value if zone.current_severity else "low",
            "last_updated": zone.last_updated,
        })
    return results


def stub_predict(features: dict) -> dict:
    """
    Stub ML prediction — accepts all 12 features, returns a deterministic
    weighted score so the same input always produces the same output.
    Drop-in point for the real model later.
    """
    w_rainfall = 0.4 * min(features["rainfall_24h"] / 100.0, 1.0)
    w_slope = 0.2 * min(features["slope"] / 60.0, 1.0)
    w_moisture = 0.2 * features["soil_moisture"]
    w_history = 0.1 * min(features["dist_to_history"], 1.0)
    w_freq = 0.1 * min(features["landslide_freq_district"] / 100.0, 1.0)
    score = round(min(w_rainfall + w_slope + w_moisture + w_history + w_freq, 1.0), 4)
    return {"risk_score": score, "severity": score_to_severity(score)}


def get_zone_history(db: Session, zone_id: str) -> Optional[dict]:
    zone = db.query(Zone).filter(Zone.zone_id == zone_id).first()
    if not zone:
        return None
    rows = (
        db.query(RiskHistory)
        .filter(RiskHistory.zone_id == zone.id)
        .order_by(RiskHistory.recorded_at.asc())
        .all()
    )
    history = [
        {"date": r.recorded_at.strftime("%Y-%m-%d"), "risk_score": r.risk_score}
        for r in rows
    ]
    return {"zone_id": zone_id, "history": history}
