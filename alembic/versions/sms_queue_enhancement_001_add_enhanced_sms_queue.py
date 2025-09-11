"""Add enhanced SMS queue and message logging

Revision ID: sms_queue_enhancement_001
Revises: f123d456e789
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'sms_queue_enhancement_001'
down_revision = '11952268b8d5'
branch_labels = None
depends_on = None

def upgrade():
    """Add enhanced SMS queue and message logging capabilities."""
    
    # Add new columns to sms_queue table (only if they don't exist)
    op.add_column('sms_queue', sa.Column('priority', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('sms_queue', sa.Column('max_attempts', sa.Integer(), nullable=False, server_default='3'))
    op.add_column('sms_queue', sa.Column('external_message_id', sa.String(255), nullable=True))
    op.add_column('sms_queue', sa.Column('last_attempt_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('sms_queue', sa.Column('next_retry_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add new columns to messages table (only if they don't exist)
    # Note: error_message, cost, external_message_id already exist, so skip those
    op.add_column('messages', sa.Column('delivery_attempts', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('messages', sa.Column('final_status', sa.String(50), nullable=True))
    op.add_column('messages', sa.Column('delivery_timestamp', sa.DateTime(timezone=True), nullable=True))
    op.add_column('messages', sa.Column('queue_item_id', sa.Integer(), nullable=True))
    op.add_column('messages', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    
    # Create message_logs table
    op.create_table('message_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('message_id', sa.Integer(), nullable=False),
        sa.Column('queue_item_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('provider_status', sa.String(100), nullable=True),
        sa.Column('provider_response', sa.JSON(), nullable=True),
        sa.Column('error_code', sa.String(50), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('attempt_number', sa.Integer(), nullable=False),
        sa.Column('external_message_id', sa.String(255), nullable=True),
        sa.Column('cost', sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column('processing_duration', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for better performance
    op.create_index('idx_sms_queue_status_priority', 'sms_queue', ['status', 'priority'])
    op.create_index('idx_sms_queue_next_retry', 'sms_queue', ['next_retry_at'])
    op.create_index('idx_sms_queue_external_id', 'sms_queue', ['external_message_id'])
    
    op.create_index('idx_messages_queue_item', 'messages', ['queue_item_id'])
    op.create_index('idx_messages_final_status', 'messages', ['final_status'])
    op.create_index('idx_messages_updated_at', 'messages', ['updated_at'])
    
    op.create_index('idx_message_logs_message_id', 'message_logs', ['message_id'])
    op.create_index('idx_message_logs_external_id', 'message_logs', ['external_message_id'])
    op.create_index('idx_message_logs_status', 'message_logs', ['status'])
    op.create_index('idx_message_logs_created_at', 'message_logs', ['created_at'])
    
    # Add foreign key constraints
    op.create_foreign_key(
        'fk_messages_queue_item',
        'messages', 'sms_queue',
        ['queue_item_id'], ['id'],
        ondelete='SET NULL'
    )
    
    op.create_foreign_key(
        'fk_message_logs_message',
        'message_logs', 'messages',
        ['message_id'], ['id_message'],
        ondelete='CASCADE'
    )
    
    op.create_foreign_key(
        'fk_message_logs_queue_item',
        'message_logs', 'sms_queue',
        ['queue_item_id'], ['id'],
        ondelete='SET NULL'
    )
    
    # Update existing records with default values
    op.execute("UPDATE sms_queue SET priority = 0 WHERE priority IS NULL")
    op.execute("UPDATE sms_queue SET max_attempts = 3 WHERE max_attempts IS NULL")
    op.execute("UPDATE messages SET delivery_attempts = 1 WHERE delivery_attempts = 0")
    
    # Add check constraints
    op.create_check_constraint(
        'ck_sms_queue_priority_range',
        'sms_queue',
        'priority >= 0 AND priority <= 10'
    )
    
    op.create_check_constraint(
        'ck_sms_queue_max_attempts_range',
        'sms_queue',
        'max_attempts >= 1 AND max_attempts <= 10'
    )
    
    op.create_check_constraint(
        'ck_messages_delivery_attempts_positive',
        'messages',
        'delivery_attempts >= 0'
    )
    
    op.create_check_constraint(
        'ck_message_logs_attempt_positive',
        'message_logs',
        'attempt_number >= 1'
    )

def downgrade():
    """Remove enhanced SMS queue and message logging capabilities."""
    
    # Drop check constraints
    op.drop_constraint('ck_message_logs_attempt_positive', 'message_logs', type_='check')
    op.drop_constraint('ck_messages_delivery_attempts_positive', 'messages', type_='check')
    op.drop_constraint('ck_sms_queue_max_attempts_range', 'sms_queue', type_='check')
    op.drop_constraint('ck_sms_queue_priority_range', 'sms_queue', type_='check')
    
    # Drop foreign key constraints
    op.drop_constraint('fk_message_logs_queue_item', 'message_logs', type_='foreignkey')
    op.drop_constraint('fk_message_logs_message', 'message_logs', type_='foreignkey')
    op.drop_constraint('fk_messages_queue_item', 'messages', type_='foreignkey')
    
    # Drop indexes
    op.drop_index('idx_message_logs_created_at', table_name='message_logs')
    op.drop_index('idx_message_logs_status', table_name='message_logs')
    op.drop_index('idx_message_logs_external_id', table_name='message_logs')
    op.drop_index('idx_message_logs_message_id', table_name='message_logs')
    
    op.drop_index('idx_messages_updated_at', table_name='messages')
    op.drop_index('idx_messages_final_status', table_name='messages')
    op.drop_index('idx_messages_queue_item', table_name='messages')
    
    op.drop_index('idx_sms_queue_external_id', table_name='sms_queue')
    op.drop_index('idx_sms_queue_next_retry', table_name='sms_queue')
    op.drop_index('idx_sms_queue_status_priority', table_name='sms_queue')
    
    # Drop message_logs table
    op.drop_table('message_logs')
    
    # Remove new columns from messages table (keep existing ones like error_message, cost, external_message_id)
    op.drop_column('messages', 'updated_at')
    op.drop_column('messages', 'queue_item_id')
    op.drop_column('messages', 'delivery_timestamp')
    op.drop_column('messages', 'final_status')
    op.drop_column('messages', 'delivery_attempts')
    
    # Remove new columns from sms_queue table
    op.drop_column('sms_queue', 'next_retry_at')
    op.drop_column('sms_queue', 'last_attempt_at')
    op.drop_column('sms_queue', 'external_message_id')
    op.drop_column('sms_queue', 'max_attempts')
    op.drop_column('sms_queue', 'priority')
