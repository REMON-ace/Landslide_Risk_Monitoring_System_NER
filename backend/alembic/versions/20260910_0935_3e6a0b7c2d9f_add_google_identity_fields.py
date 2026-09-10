"""Add Google identity fields to users.

Revision ID: 3e6a0b7c2d9f
Revises: 9b4e2c7d1a3f
Create Date: 2026-09-10 09:35:00.000000+00:00
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "3e6a0b7c2d9f"
down_revision: Union[str, None] = "9b4e2c7d1a3f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("email", sa.String(length=254), nullable=True))
    op.add_column("users", sa.Column("google_sub", sa.String(length=255), nullable=True))
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_google_sub", "users", ["google_sub"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_google_sub", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_column("users", "google_sub")
    op.drop_column("users", "email")
