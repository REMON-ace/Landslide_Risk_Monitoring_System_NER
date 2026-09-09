"""
Weather & sensor service.
"""
from __future__ import annotations

from typing import List, Optional

from geoalchemy2.functions import ST_X, ST_Y, ST_Distance, ST_MakePoint, ST_SetSRID
from sqlalchemy.orm import Session
from sqlalchemy import func, cast
from geoalchemy2 import Geography

from app.models.models import Zone, WeatherReading, SoilSensor
from app.db.session import engine


def get_current_weather(db: Session, lat: float, lng: float) -> Optional[dict]:
    """
    Find the nearest zone to (lat, lng) and return its latest weather reading.
    """
    if engine.dialect.name == "sqlite":
        zones = db.query(Zone).all()
        if not zones:
            return None
        def parse_pt(z):
            if z.geometry and "POINT(" in str(z.geometry):
                try:
                    c = str(z.geometry).replace("POINT(", "").replace(")", "").strip().split()
                    return float(c[0]), float(c[1])
                except Exception:
                    pass
            return 0.0, 0.0
        zone = min(zones, key=lambda z: (parse_pt(z)[0] - lng)**2 + (parse_pt(z)[1] - lat)**2)
    else:
        # Find nearest zone by PostGIS distance
        target = ST_SetSRID(ST_MakePoint(lng, lat), 4326)

        zone_row = (
            db.query(Zone, ST_X(Zone.geometry).label("z_lng"), ST_Y(Zone.geometry).label("z_lat"))
            .order_by(ST_Distance(Zone.geometry, target))
            .first()
        )
        if not zone_row:
            return None

        zone, z_lng, z_lat = zone_row

    reading = (
        db.query(WeatherReading)
        .filter(WeatherReading.zone_id == zone.id)
        .order_by(WeatherReading.recorded_at.desc())
        .first()
    )

    if reading:
        return {
            "lat": lat,
            "lng": lng,
            "rainfall_24h": reading.rainfall_24h,
            "rainfall_72h": reading.rainfall_72h,
            "rainfall_7d": reading.rainfall_7d,
            "rainfall_intensity_peak": reading.rainfall_intensity_peak,
            "antecedent_rainfall_index": reading.antecedent_rainfall_index,
            "forecast_next_24h": reading.forecast_next_24h,
            "source": reading.source,
        }

    # Fallback: return zeros if no reading exists yet
    return {
        "lat": lat,
        "lng": lng,
        "rainfall_24h": 0.0,
        "rainfall_72h": 0.0,
        "rainfall_7d": 0.0,
        "rainfall_intensity_peak": 0.0,
        "antecedent_rainfall_index": 0.0,
        "forecast_next_24h": 0.0,
        "source": "IMD",
    }


def get_soil_moisture(db: Session, zone_id: Optional[str] = None) -> List[dict]:
    q = db.query(SoilSensor, Zone.zone_id.label("z_zone_id"))
    q = q.join(Zone, SoilSensor.zone_id == Zone.id)

    if zone_id:
        q = q.filter(Zone.zone_id == zone_id)

    results = []
    for sensor, z_zone_id in q.all():
        results.append({
            "sensor_id": sensor.sensor_id,
            "zone_id": z_zone_id,
            "moisture": sensor.moisture,
            "timestamp": sensor.recorded_at,
        })
    return results
