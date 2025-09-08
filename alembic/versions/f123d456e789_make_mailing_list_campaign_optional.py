"""make mailing list campaign optional

Revision ID: f123d456e789
Revises: e406c986d79e
Create Date: 2025-09-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f123d456e789'
down_revision = 'e406c986d79e'
branch_labels = None
depends_on = None

def upgrade():
    # Make id_campagne nullable in mailing_lists table
    op.alter_column('mailing_lists', 'id_campagne',
                    existing_type=sa.Integer(),
                    nullable=True)

def downgrade():
    # Make id_campagne not nullable again
    op.alter_column('mailing_lists', 'id_campagne',
                    existing_type=sa.Integer(),
                    nullable=False)
