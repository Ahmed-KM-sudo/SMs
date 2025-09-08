"""add contact lists functionality

Revision ID: a123b456c789
Revises: f123d456e789
Create Date: 2025-09-08 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a123b456c789'
down_revision = 'f123d456e789'
branch_labels = None
depends_on = None

def upgrade():
    # Create contact_lists table
    op.create_table('contact_lists',
        sa.Column('id_contact_list', sa.Integer(), nullable=False),
        sa.Column('nom_liste', sa.String(length=100), nullable=False),
        sa.Column('type_client', sa.String(length=50), nullable=False),
        sa.Column('zone_geographique', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=True),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint('id_contact_list')
    )
    
    # Create contact_list_contacts junction table
    op.create_table('contact_list_contacts',
        sa.Column('id_contact_list', sa.Integer(), nullable=False),
        sa.Column('id_contact', sa.Integer(), nullable=False),
        sa.Column('added_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['id_contact_list'], ['contact_lists.id_contact_list'], ),
        sa.ForeignKeyConstraint(['id_contact'], ['contacts.id_contact'], ),
        sa.PrimaryKeyConstraint('id_contact_list', 'id_contact')
    )

def downgrade():
    op.drop_table('contact_list_contacts')
    op.drop_table('contact_lists')
