"""add residency fields

Revision ID: 88cae4f5561e
Revises: 001_initial
Create Date: 2026-09-09 19:12:41.777737+00:00

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '88cae4f5561e'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Some deployed instances temporarily added these columns during app startup
    # before this revision was recorded.  Keep this historical migration safe to
    # apply in either state so Alembic can advance its version table correctly.
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS proof_path VARCHAR(500) NULL")
    op.execute(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false"
    )

def downgrade() -> None:
    op.drop_column('users', 'is_verified')
    op.drop_column('users', 'proof_path')
