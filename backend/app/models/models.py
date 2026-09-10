"""
SQLAlchemy models for all tables.
All spatial columns use PostGIS GEOMETRY types via GeoAlchemy2.
"""
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, Float, String, Text, Enum, DateTime,
    ForeignKey, JSON, Boolean, BigInteger
)
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from app.db.base import Base
from app.db.session import engine


def SpatialColumn(geom_type, srid=4326):
    if engine.dialect.name == "sqlite":
        return Text
    return Geometry(geom_type, srid=srid)


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class SeverityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class RoadStatusEnum(str, enum.Enum):
    clear = "clear"
    partial = "partial"
    blocked = "blocked"


class ReporterTypeEnum(str, enum.Enum):
    citizen = "citizen"
    official = "official"


class ReportStatusEnum(str, enum.Enum):
    received = "received"
    verified = "verified"
    dismissed = "dismissed"
    archived = "archived"


class UserRoleEnum(str, enum.Enum):
    district_admin = "district_admin"
    field_official = "field_official"
    citizen = "citizen"


# ---------------------------------------------------------------------------
# Zones
# ---------------------------------------------------------------------------

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String(50), unique=True, nullable=False, index=True)
    village_name = Column(String(200), nullable=False)
    geometry = Column(SpatialColumn("POINT", srid=4326), nullable=False)
    district = Column(String(200), nullable=False)
    current_risk_score = Column(Float, default=0.0)
    current_severity = Column(Enum(SeverityEnum), default=SeverityEnum.low)
    last_updated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Static terrain/historical columns for ML model input
    slope = Column(Float, nullable=True)
    aspect = Column(Float, nullable=True)
    elevation = Column(Float, nullable=True)
    curvature = Column(Float, nullable=True)
    dist_to_drainage = Column(Float, nullable=True)
    dist_to_history = Column(Float, nullable=True)
    landslide_freq_district = Column(Integer, nullable=True)

    # Relationships
    risk_history = relationship("RiskHistory", back_populates="zone", cascade="all, delete-orphan")
    weather_readings = relationship("WeatherReading", back_populates="zone", cascade="all, delete-orphan")
    soil_sensors = relationship("SoilSensor", back_populates="zone", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="zone", cascade="all, delete-orphan")
    villages = relationship("Village", back_populates="zone")


# ---------------------------------------------------------------------------
# Risk history
# ---------------------------------------------------------------------------

class RiskHistory(Base):
    __tablename__ = "risk_history"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    risk_score = Column(Float, nullable=False)
    recorded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    zone = relationship("Zone", back_populates="risk_history")


# ---------------------------------------------------------------------------
# Weather readings
# ---------------------------------------------------------------------------

class WeatherReading(Base):
    __tablename__ = "weather_readings"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    rainfall_24h = Column(Float, default=0.0)
    rainfall_72h = Column(Float, default=0.0)
    rainfall_7d = Column(Float, default=0.0)
    rainfall_intensity_peak = Column(Float, default=0.0)
    antecedent_rainfall_index = Column(Float, default=0.0)
    forecast_next_24h = Column(Float, default=0.0)
    source = Column(String(100), default="IMD")
    recorded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    zone = relationship("Zone", back_populates="weather_readings")


# ---------------------------------------------------------------------------
# Soil sensors
# ---------------------------------------------------------------------------

class SoilSensor(Base):
    __tablename__ = "soil_sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), unique=True, nullable=False, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    moisture = Column(Float, nullable=False)
    recorded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    zone = relationship("Zone", back_populates="soil_sensors")


# ---------------------------------------------------------------------------
# Roads
# ---------------------------------------------------------------------------

class Road(Base):
    __tablename__ = "roads"

    id = Column(Integer, primary_key=True, index=True)
    road_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(300), nullable=False)
    status = Column(Enum(RoadStatusEnum), default=RoadStatusEnum.clear)
    geometry = Column(SpatialColumn("LINESTRING", srid=4326), nullable=False)
    district = Column(String(200), nullable=True)
    last_updated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Villages
# ---------------------------------------------------------------------------

class Village(Base):
    __tablename__ = "villages"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    geometry = Column(SpatialColumn("POINT", srid=4326), nullable=False)
    population = Column(Integer, default=0)
    zone_id = Column(String(50), ForeignKey("zones.zone_id", ondelete="SET NULL"), nullable=True, index=True)

    zone = relationship("Zone", back_populates="villages", foreign_keys=[zone_id])


# ---------------------------------------------------------------------------
# Field reports
# ---------------------------------------------------------------------------

class FieldReport(Base):
    __tablename__ = "field_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(50), unique=True, nullable=False, index=True)
    client_report_id = Column(String(200), nullable=True, unique=True, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    reporter_type = Column(Enum(ReporterTypeEnum), default=ReporterTypeEnum.citizen)
    language = Column(String(20), default="en")
    status = Column(Enum(ReportStatusEnum), default=ReportStatusEnum.received)
    severity = Column(Enum(SeverityEnum), default=SeverityEnum.medium, nullable=True)
    hazard_category = Column(String(100), nullable=True, default="general_hazard")
    ai_analysis = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True, default=0.85)
    recommended_action = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, nullable=False, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    severity = Column(Enum(SeverityEnum), nullable=False)
    message = Column(Text, nullable=False)
    language = Column(String(20), default="en")
    channels = Column(JSON, default=list)
    sent_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    recipients_count = Column(Integer, default=0)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    description = Column(Text, nullable=True)

    zone = relationship("Zone", back_populates="alerts")


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(300), nullable=False)
    role = Column(Enum(UserRoleEnum), default=UserRoleEnum.field_official)
    district = Column(String(200), nullable=True)
    proof_path = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    email = Column(String(254), unique=True, nullable=True, index=True)
    google_sub = Column(String(255), unique=True, nullable=True, index=True)


class UserDevice(Base):
    """A browser's FCM registration token, linked to exactly one user."""
    __tablename__ = "user_devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    fcm_token = Column(String(512), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
