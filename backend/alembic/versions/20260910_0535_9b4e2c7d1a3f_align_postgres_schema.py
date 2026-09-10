"""Align PostgreSQL schema with the current SQLAlchemy models.

Revision ID: 9b4e2c7d1a3f
Revises: 88cae4f5561e
Create Date: 2026-09-10 05:35:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op


revision: str = "9b4e2c7d1a3f"
down_revision: Union[str, None] = "88cae4f5561e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply only additive, PostgreSQL-safe changes to the deployed schema."""
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        raise RuntimeError("This migration requires PostgreSQL and the existing PostGIS schema.")

    # PostgreSQL does not safely support removing enum labels.  IF NOT EXISTS
    # keeps this revision usable when a value was added manually beforehand.
    op.execute("ALTER TYPE userroleenum ADD VALUE IF NOT EXISTS 'citizen'")
    op.execute("ALTER TYPE reportstatusenum ADD VALUE IF NOT EXISTS 'archived'")

    op.execute("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS description TEXT NULL")
    # lat/lng are also current Alert model fields and were absent from 001_initial.
    op.execute("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION NULL")
    op.execute("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION NULL")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NULL")

    # Fresh databases at 001_initial have no severity column.  One deployed
    # database acquired it as VARCHAR through former startup compatibility code;
    # convert that column in place so it uses the existing severityenum type.
    op.execute(
        """
        DO $$
        DECLARE
            severity_type text;
        BEGIN
            SELECT udt_name
              INTO severity_type
              FROM information_schema.columns
             WHERE table_schema = current_schema()
               AND table_name = 'field_reports'
               AND column_name = 'severity';

            IF severity_type IS NULL THEN
                ALTER TABLE field_reports
                    ADD COLUMN severity severityenum NULL;
            ELSIF severity_type <> 'severityenum' THEN
                IF severity_type NOT IN ('varchar', 'text', 'bpchar') THEN
                    RAISE EXCEPTION
                        'field_reports.severity has unexpected type %, expected severityenum or text-compatible type',
                        severity_type;
                END IF;

                IF EXISTS (
                    SELECT 1
                      FROM field_reports
                     WHERE severity IS NOT NULL
                       AND lower(severity::text) NOT IN ('low', 'medium', 'high', 'critical')
                ) THEN
                    RAISE EXCEPTION
                        'field_reports.severity contains values outside severityenum; correct them before migration';
                END IF;

                ALTER TABLE field_reports ALTER COLUMN severity DROP DEFAULT;
                ALTER TABLE field_reports
                    ALTER COLUMN severity TYPE severityenum
                    USING CASE
                        WHEN severity IS NULL THEN NULL
                        ELSE lower(severity::text)::severityenum
                    END;
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    """Remove added columns; enum labels intentionally remain for PostgreSQL safety."""
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        raise RuntimeError("This migration requires PostgreSQL and the existing PostGIS schema.")

    op.execute("ALTER TABLE field_reports DROP COLUMN IF EXISTS severity")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS created_at")
    op.execute("ALTER TABLE alerts DROP COLUMN IF EXISTS lng")
    op.execute("ALTER TABLE alerts DROP COLUMN IF EXISTS lat")
    op.execute("ALTER TABLE alerts DROP COLUMN IF EXISTS description")
    # PostgreSQL enum value removal requires rebuilding dependent types and can
    # lose data; deliberately leave citizen and archived labels in place.
