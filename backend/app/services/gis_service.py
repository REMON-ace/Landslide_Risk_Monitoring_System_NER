"""
GIS service — roads and villages.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import List, Optional

from geoalchemy2.functions import ST_X, ST_Y, ST_AsGeoJSON
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import Road, Village, Zone, RoadStatusEnum


def _linestring_geojson_to_coords(geojson_str: Optional[str]) -> List[List[float]]:
    """Parse ST_AsGeoJSON output (GeoJSON string) to [[lat, lng], ...] list."""
    if not geojson_str:
        return []
    try:
        geojson = json.loads(geojson_str)
        # GeoJSON coordinates are [lng, lat] — spec says [lat, lng]
        return [[c[1], c[0]] for c in geojson["coordinates"]]
    except Exception:
        return []


def _road_to_dict(road: Road, geojson_str: Optional[str] = None) -> dict:
    coords = _linestring_geojson_to_coords(geojson_str)
    return {
        "road_id": road.road_id,
        "name": road.name,
        "status": road.status.value if road.status else "clear",
        "coordinates": coords,
        "last_updated": road.last_updated,
    }


def get_roads(
    db: Session,
    district: Optional[str] = None,
    status: Optional[str] = None,
) -> List[dict]:
    q = db.query(Road, ST_AsGeoJSON(Road.geometry).label("geojson"))
    if district:
        q = q.filter(func.lower(Road.district) == district.lower())
    if status:
        try:
            status_enum = RoadStatusEnum(status)
            q = q.filter(Road.status == status_enum)
        except ValueError:
            return []
    return [_road_to_dict(road, geojson) for road, geojson in q.all()]


def patch_road(db: Session, road_id: str, status: str) -> Optional[dict]:
    road = db.query(Road).filter(Road.road_id == road_id).first()
    if not road:
        return None
    road.status = RoadStatusEnum(status)
    road.last_updated = datetime.now(timezone.utc)
    db.commit()
    db.refresh(road)
    # Fetch with GeoJSON
    row = db.query(Road, ST_AsGeoJSON(Road.geometry).label("geojson")).filter(
        Road.road_id == road_id
    ).first()
    if row:
        return _road_to_dict(row[0], row[1])
    return _road_to_dict(road)


def get_villages(db: Session) -> List[dict]:
    rows = db.query(
        Village,
        ST_X(Village.geometry).label("lng"),
        ST_Y(Village.geometry).label("lat"),
    ).all()
    results = []
    for village, lng, lat in rows:
        results.append({
            "village_id": village.village_id,
            "name": village.name,
            "lat": lat,
            "lng": lng,
            "population": village.population,
            "zone_id": village.zone_id,
        })
    return results
