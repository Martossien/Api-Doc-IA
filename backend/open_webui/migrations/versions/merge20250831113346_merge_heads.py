"""Merge multiple heads

Revision ID: merge20250831113346
Revises: 3781e22d8b01, 709895bdd124
Create Date: 2025-08-31 11:33:46.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'merge20250831113346'
down_revision = ['3781e22d8b01', '709895bdd124']
branch_labels = None
depends_on = None


def upgrade():
    """Merge migration - no schema changes needed."""
    pass


def downgrade():
    """Merge migration - no schema changes to revert."""
    pass