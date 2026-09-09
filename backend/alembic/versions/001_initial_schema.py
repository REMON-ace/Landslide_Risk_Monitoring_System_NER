"""Initial schema — all tables with PostGIS geometry

Revision ID: 001_initial
Revises: 
Create Date: 2026-09-09 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
import geoalchemy2
from alembic import op

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable PostGIS extension
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    # ------------------------------------------------------------------ zones
    op.create_table(
        "zones",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("zone_id", sa.String(50), nullable=False),
        sa.Column("village_name", sa.String(200), nullable=False),
        sa.Column(
            "geometry",
            geoalchemy2.types.Geometry(geometry_type="POINT", srid=4326),
            nullable=False,
        ),
        sa.Column("district", sa.String(200), nullable=False),
        sa.Column("current_risk_score", sa.Float(), nullable=True, default=0.0),
        sa.Column(
            "current_severity",
            sa.Enum("low", "medium", "high", "critical", name="severityenum"),
            nullable=True,
        ),
        sa.Column("last_updated", sa.DateTime(timezone=True), nullable=True),
        # ML terrain/historical columns
        sa.Column("slope", sa.Float(), nullable=True),
        sa.Column("aspect", sa.Float(), nullable=True),
        sa.Column("elevation", sa.Float(), nullable=True),
        sa.Column("curvature", sa.Float(), nullable=True),
        sa.Column("dist_to_drainage", sa.Float(), nullable=True),
        sa.Column("dist_to_history", sa.Float(), nullable=True),
        sa.Column("landslide_freq_district", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_zones_zone_id", "zones", ["zone_id"], unique=True)

    # ------------------------------------------------------------ risk_history
    op.create_table(
        "risk_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("zone_id", sa.Integer(), nullable=False),
        sa.Column("risk_score", sa.Float(), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_risk_history_zone_id", "risk_history", ["zone_id"])

    # -------------------------------------------------------- weather_readings
    op.create_table(
        "weather_readings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("zone_id", sa.Integer(), nullable=False),
        sa.Column("rainfall_24h", sa.Float(), nullable=True),
        sa.Column("rainfall_72h", sa.Float(), nullable=True),
        sa.Column("rainfall_7d", sa.Float(), nullable=True),
        sa.Column("rainfall_intensity_peak", sa.Float(), nullable=True),
        sa.Column("antecedent_rainfall_index", sa.Float(), nullable=True),
        sa.Column("forecast_next_24h", sa.Float(), nullable=True),
        sa.Column("source", sa.String(100), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_weather_readings_zone_id", "weather_readings", ["zone_id"])

    # ------------------------------------------------------------ soil_sensors
    op.create_table(
        "soil_sensors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sensor_id", sa.String(50), nullable=False),
        sa.Column("zone_id", sa.Integer(), nullable=False),
        sa.Column("moisture", sa.Float(), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_soil_sensors_sensor_id", "soil_sensors", ["sensor_id"], unique=True)
    op.create_index("ix_soil_sensors_zone_id", "soil_sensors", ["zone_id"])

    # ------------------------------------------------------------------ roads
    op.create_table(
        "roads",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("road_id", sa.String(50), nullable=False),
        sa.Column("name", sa.String(300), nullable=False),
        sa.Column(
            "status",
            sa.Enum("clear", "partial", "blocked", name="roadstatusenum"),
            nullable=True,
        ),
        sa.Column(
            "geometry",
            geoalchemy2.types.Geometry(geometry_type="LINESTRING", srid=4326),
            nullable=False,
        ),
        sa.Column("district", sa.String(200), nullable=True),
        sa.Column("last_updated", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_roads_road_id", "roads", ["road_id"], unique=True)

    # --------------------------------------------------------------- villages
    op.create_table(
        "villages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("village_id", sa.String(50), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column(
            "geometry",
            geoalchemy2.types.Geometry(geometry_type="POINT", srid=4326),
            nullable=False,
        ),
        sa.Column("population", sa.Integer(), nullable=True),
        sa.Column("zone_id", sa.String(50), nullable=True),
        sa.ForeignKeyConstraint(["zone_id"], ["zones.zone_id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_villages_village_id", "villages", ["village_id"], unique=True)
    op.create_index("ix_villages_zone_id", "villages", ["zone_id"])

    # ----------------------------------------------------------- field_reports
    op.create_table(
        "field_reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("report_id", sa.String(50), nullable=False),
        sa.Column("client_report_id", sa.String(200), nullable=True),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lng", sa.Float(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("photo_url", sa.String(500), nullable=True),
        sa.Column(
            "reporter_type",
            sa.Enum("citizen", "official", name="reportertypeenum"),
            nullable=True,
        ),
        sa.Column("language", sa.String(20), nullable=True),
        sa.Column(
            "status",
            sa.Enum("received", "verified", "dismissed", name="reportstatusenum"),
            nullable=True,
        ),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_field_reports_report_id", "field_reports", ["report_id"], unique=True)
    op.create_index(
        "ix_field_reports_client_report_id", "field_reports", ["client_report_id"], unique=True
    )

    # --------------------------------------------------------------- alerts
    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("alert_id", sa.String(50), nullable=False),
        sa.Column("zone_id", sa.Integer(), nullable=False),
        sa.Column("severity", sa.Enum("low", "medium", "high", "critical", name="severityenum"), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("language", sa.String(20), nullable=True),
        sa.Column("channels", sa.JSON(), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("recipients_count", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_alerts_alert_id", "alerts", ["alert_id"], unique=True)
    op.create_index("ix_alerts_zone_id", "alerts", ["zone_id"])

    # ------------------------------------------------------------------ users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(150), nullable=False),
        sa.Column("hashed_password", sa.String(300), nullable=False),
        sa.Column(
            "role",
            sa.Enum("district_admin", "field_official", name="userroleenum"),
            nullable=True,
        ),
        sa.Column("district", sa.String(200), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)


def downgrade() -> None:
    op.drop_table("users")
    op.drop_table("alerts")
    op.drop_table("field_reports")
    op.drop_table("villages")
    op.drop_table("roads")
    op.drop_table("soil_sensors")
    op.drop_table("weather_readings")
    op.drop_table("risk_history")
    op.drop_table("zones")
    # Drop enums
    sa.Enum(name="userroleenum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="reportstatusenum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="reportertypeenum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="roadstatusenum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="severityenum").drop(op.get_bind(), checkfirst=True)
