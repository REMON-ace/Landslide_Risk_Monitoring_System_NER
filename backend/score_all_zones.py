"""
score_all_zones.py — Batch job that refreshes risk scores for all zones.

This script reads static terrain columns from the zones table,
fetches the latest dynamic weather+soil readings, builds the 12-feature
input vector for each zone, calls POST /api/predict-risk (stub or real model),
and writes the result back to zones.current_risk_score / current_severity
and appends a row to risk_history.

Run manually or schedule via cron / Task Scheduler:
    python score_all_zones.py

The script is intentionally decoupled from the HTTP layer — it calls the
service functions directly so it works even if the server is not running.
"""
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))

from app.db.session import SessionLocal, engine
from app.models.models import Zone, WeatherReading, SoilSensor, RiskHistory, SeverityEnum
from app.services.risk_service import stub_predict
from geoalchemy2.functions import ST_X, ST_Y


def score_all_zones():
    db = SessionLocal()
    try:
        if engine.dialect.name == "sqlite":
            zone_list = db.query(Zone).all()
            zones = []
            for z in zone_list:
                lng, lat = 0.0, 0.0
                if z.geometry and "POINT(" in str(z.geometry):
                    try:
                        c = str(z.geometry).replace("POINT(", "").replace(")", "").strip().split()
                        lng, lat = float(c[0]), float(c[1])
                    except Exception:
                        pass
                zones.append((z, lng, lat))
        else:
            zones = db.query(Zone, ST_X(Zone.geometry).label("lng"), ST_Y(Zone.geometry).label("lat")).all()
        now = datetime.now(timezone.utc)
        updated = 0

        for zone, lng, lat in zones:
            # Latest weather reading
            weather = (
                db.query(WeatherReading)
                .filter(WeatherReading.zone_id == zone.id)
                .order_by(WeatherReading.recorded_at.desc())
                .first()
            )
            # Latest soil reading
            soil = (
                db.query(SoilSensor)
                .filter(SoilSensor.zone_id == zone.id)
                .order_by(SoilSensor.recorded_at.desc())
                .first()
            )

            # Check we have required data
            if not weather:
                print(f"  [WARN] Zone {zone.zone_id}: no weather reading -- skipping")
                continue
            if zone.slope is None:
                print(f"  [WARN] Zone {zone.zone_id}: terrain columns not populated -- skipping")
                continue

            features = {
                # Static terrain / historical (from zones table)
                "slope": zone.slope,
                "aspect": zone.aspect or 0.0,
                "elevation": zone.elevation or 0.0,
                "curvature": zone.curvature or 0.0,
                "dist_to_drainage": zone.dist_to_drainage or 0.0,
                "dist_to_history": zone.dist_to_history or 0.0,
                "landslide_freq_district": zone.landslide_freq_district or 0,
                # Dynamic weather (from weather_readings table)
                "rainfall_24h": weather.rainfall_24h,
                "rainfall_72h": weather.rainfall_72h,
                "rainfall_7d": weather.rainfall_7d,
                "rainfall_intensity_peak": weather.rainfall_intensity_peak,
                "antecedent_rainfall_index": weather.antecedent_rainfall_index,
                # Dynamic soil (from soil_sensors table)
                "soil_moisture": soil.moisture if soil else 0.5,
            }

            result = stub_predict(features)
            score = result["risk_score"]
            severity_str = result["severity"]

            # Update zone
            zone.current_risk_score = score
            zone.current_severity = SeverityEnum(severity_str)
            zone.last_updated = now

            # Append history row
            db.add(RiskHistory(zone_id=zone.id, risk_score=score, recorded_at=now))
            updated += 1

        db.commit()
        print(f"[OK] Scored {updated} zones at {now.isoformat()}")
    finally:
        db.close()


if __name__ == "__main__":
    print("[INFO] Scoring all zones...")
    score_all_zones()
