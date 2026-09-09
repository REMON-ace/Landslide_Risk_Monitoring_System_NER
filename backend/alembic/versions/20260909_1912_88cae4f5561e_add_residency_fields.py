"""add residency fields

Revision ID: 88cae4f5561e
Revises: 001_initial
Create Date: 2026-09-09 19:12:41.777737+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = '88cae4f5561e'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('proof_path', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    # Ensure existing rows have is_verified=False (default already applies)

def downgrade() -> None:
    op.drop_column('users', 'is_verified')
    op.drop_column('users', 'proof_path')
