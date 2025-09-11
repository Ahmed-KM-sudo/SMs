import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.db.models import SMSQueue, Message, MessageLog, Contact, Campaign
from app.utils.phone_validator import validate_and_format_phone_number, InvalidPhoneNumberError
from app.core.config import settings

logger = logging.getLogger(__name__)

class SMSQueueService:
    """
    Enhanced SMS Queue Service for managing SMS queue operations with comprehensive logging.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def add_to_queue(
        self, 
        campaign_id: int, 
        contact_id: int, 
        message_content: str,
        scheduled_at: Optional[datetime] = None,
        priority: int = 5,
        max_attempts: int = 3
    ) -> SMSQueue:
        """
        Add a message to the SMS queue with validation and logging.
        
        Args:
            campaign_id: ID of the campaign
            contact_id: ID of the contact
            message_content: The SMS message content
            scheduled_at: When to send the message (defaults to now)
            priority: Message priority (1=highest, 10=lowest)
            max_attempts: Maximum retry attempts
            
        Returns:
            SMSQueue: The created queue item
            
        Raises:
            ValueError: If validation fails
        """
        if scheduled_at is None:
            scheduled_at = datetime.now(timezone.utc)
        
        # Validate contact phone number
        contact = self.db.query(Contact).filter(Contact.id_contact == contact_id).first()
        if not contact:
            raise ValueError(f"Contact {contact_id} not found")
        
        try:
            # Validate phone number format
            validate_and_format_phone_number(
                contact.numero_telephone, 
                getattr(settings, 'DEFAULT_COUNTRY_CODE', 'FR')
            )
        except InvalidPhoneNumberError as e:
            logger.error(f"Invalid phone number for contact {contact_id}: {e}")
            raise ValueError(f"Invalid phone number: {e}")
        
        # Validate campaign exists and is active
        campaign = self.db.query(Campaign).filter(Campaign.id_campagne == campaign_id).first()
        if not campaign:
            raise ValueError(f"Campaign {campaign_id} not found")
        
        if campaign.statut not in ['active', 'scheduled']:
            raise ValueError(f"Campaign {campaign_id} is not active or scheduled")
        
        # Create queue item
        queue_item = SMSQueue(
            campaign_id=campaign_id,
            contact_id=contact_id,
            message_content=message_content,
            scheduled_at=scheduled_at,
            priority=priority,
            max_attempts=max_attempts,
            status='pending'
        )
        
        self.db.add(queue_item)
        self.db.commit()
        self.db.refresh(queue_item)
        
        logger.info(f"Added message to queue: ID={queue_item.id}, Campaign={campaign_id}, Contact={contact_id}")
        return queue_item
    
    def get_pending_messages(self, limit: int = 100, priority_order: bool = True) -> List[SMSQueue]:
        """
        Get pending messages from the queue, ordered by priority and creation time.
        
        Args:
            limit: Maximum number of messages to retrieve
            priority_order: Whether to order by priority (True) or just creation time
            
        Returns:
            List of pending SMSQueue items
        """
        query = self.db.query(SMSQueue).filter(
            and_(
                SMSQueue.status == 'pending',
                SMSQueue.scheduled_at <= datetime.now(timezone.utc),
                or_(
                    SMSQueue.next_retry_at.is_(None),
                    SMSQueue.next_retry_at <= datetime.now(timezone.utc)
                )
            )
        )
        
        if priority_order:
            query = query.order_by(SMSQueue.priority.asc(), SMSQueue.created_at.asc())
        else:
            query = query.order_by(SMSQueue.created_at.asc())
        
        return query.limit(limit).all()
    
    def mark_processing(self, queue_items: List[SMSQueue]) -> List[SMSQueue]:
        """
        Mark queue items as processing to prevent duplicate processing.
        
        Args:
            queue_items: List of queue items to mark as processing
            
        Returns:
            List of successfully marked items
        """
        if not queue_items:
            return []
        
        item_ids = [item.id for item in queue_items]
        
        # Atomically update status to processing
        updated_count = self.db.query(SMSQueue).filter(
            and_(
                SMSQueue.id.in_(item_ids),
                SMSQueue.status == 'pending'  # Only update if still pending
            )
        ).update(
            {
                'status': 'processing',
                'last_attempt_at': datetime.now(timezone.utc)
            },
            synchronize_session=False
        )
        
        self.db.commit()
        
        if updated_count != len(item_ids):
            logger.warning(f"Only {updated_count} of {len(item_ids)} items were marked as processing")
        
        # Return the updated items
        return self.db.query(SMSQueue).filter(SMSQueue.id.in_(item_ids)).all()
    
    def mark_sent(self, queue_item: SMSQueue, external_message_id: str) -> None:
        """
        Mark a queue item as successfully sent.
        
        Args:
            queue_item: The queue item to update
            external_message_id: External ID from SMS provider
        """
        queue_item.status = 'sent'
        queue_item.processed_at = datetime.now(timezone.utc)
        queue_item.external_message_id = external_message_id
        queue_item.error_message = None
        
        self.db.commit()
        logger.info(f"Marked queue item {queue_item.id} as sent with external ID {external_message_id}")
    
    def mark_failed(
        self, 
        queue_item: SMSQueue, 
        error_message: str, 
        should_retry: bool = True
    ) -> None:
        """
        Mark a queue item as failed and determine if it should be retried.
        
        Args:
            queue_item: The queue item to update
            error_message: The error message
            should_retry: Whether this failure should trigger a retry
        """
        queue_item.attempts += 1
        queue_item.last_attempt_at = datetime.now(timezone.utc)
        queue_item.error_message = error_message
        
        if should_retry and queue_item.attempts < queue_item.max_attempts:
            # Calculate exponential backoff: 2^attempt_number minutes
            backoff_minutes = 2 ** queue_item.attempts
            queue_item.next_retry_at = datetime.now(timezone.utc) + timedelta(minutes=backoff_minutes)
            queue_item.status = 'pending'  # Reset to pending for retry
            logger.info(f"Queue item {queue_item.id} failed (attempt {queue_item.attempts}), will retry at {queue_item.next_retry_at}")
        else:
            queue_item.status = 'failed'
            logger.error(f"Queue item {queue_item.id} permanently failed after {queue_item.attempts} attempts: {error_message}")
        
        self.db.commit()
    
    def cancel_message(self, queue_item_id: int, reason: str = "Cancelled by user") -> bool:
        """
        Cancel a pending message in the queue.
        
        Args:
            queue_item_id: ID of the queue item to cancel
            reason: Reason for cancellation
            
        Returns:
            True if successfully cancelled, False otherwise
        """
        queue_item = self.db.query(SMSQueue).filter(SMSQueue.id == queue_item_id).first()
        
        if not queue_item:
            logger.warning(f"Queue item {queue_item_id} not found for cancellation")
            return False
        
        if queue_item.status not in ['pending', 'processing']:
            logger.warning(f"Cannot cancel queue item {queue_item_id} with status {queue_item.status}")
            return False
        
        queue_item.status = 'cancelled'
        queue_item.error_message = reason
        queue_item.processed_at = datetime.now(timezone.utc)
        
        self.db.commit()
        logger.info(f"Cancelled queue item {queue_item_id}: {reason}")
        return True
    
    def get_queue_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive queue statistics.
        
        Returns:
            Dictionary with queue statistics
        """
        stats = {}
        
        # Status counts
        status_counts = self.db.query(
            SMSQueue.status,
            func.count(SMSQueue.id).label('count')
        ).group_by(SMSQueue.status).all()
        
        stats['status_counts'] = {status: count for status, count in status_counts}
        
        # Priority distribution for pending messages
        priority_counts = self.db.query(
            SMSQueue.priority,
            func.count(SMSQueue.id).label('count')
        ).filter(SMSQueue.status == 'pending').group_by(SMSQueue.priority).all()
        
        stats['priority_distribution'] = {priority: count for priority, count in priority_counts}
        
        # Average processing time for sent messages (last 24 hours)
        twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
        
        avg_processing_time = self.db.query(
            func.avg(
                func.extract('epoch', SMSQueue.processed_at - SMSQueue.created_at)
            ).label('avg_seconds')
        ).filter(
            and_(
                SMSQueue.status == 'sent',
                SMSQueue.processed_at >= twenty_four_hours_ago
            )
        ).scalar()
        
        stats['avg_processing_time_seconds'] = float(avg_processing_time) if avg_processing_time else 0
        
        # Failed messages requiring attention
        failed_count = self.db.query(func.count(SMSQueue.id)).filter(
            SMSQueue.status == 'failed'
        ).scalar()
        
        stats['failed_messages'] = failed_count
        
        # Messages scheduled for future
        future_scheduled = self.db.query(func.count(SMSQueue.id)).filter(
            and_(
                SMSQueue.status == 'pending',
                SMSQueue.scheduled_at > datetime.now(timezone.utc)
            )
        ).scalar()
        
        stats['future_scheduled'] = future_scheduled
        
        return stats
    
    def cleanup_old_records(self, days_to_keep: int = 30) -> int:
        """
        Clean up old processed queue records.
        
        Args:
            days_to_keep: Number of days to keep processed records
            
        Returns:
            Number of records deleted
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_to_keep)
        
        deleted_count = self.db.query(SMSQueue).filter(
            and_(
                SMSQueue.status.in_(['sent', 'failed', 'cancelled']),
                SMSQueue.processed_at < cutoff_date
            )
        ).delete(synchronize_session=False)
        
        self.db.commit()
        
        if deleted_count > 0:
            logger.info(f"Cleaned up {deleted_count} old queue records older than {cutoff_date}")
        
        return deleted_count
    
    def get_queue_items(
        self,
        status: Optional[str] = None,
        campaign_id: Optional[int] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[SMSQueue]:
        """
        Get queue items with optional filtering and pagination.
        
        Args:
            status: Filter by status
            campaign_id: Filter by campaign ID
            limit: Maximum number of items to return
            offset: Number of items to skip
            
        Returns:
            List of SMSQueue items
        """
        query = self.db.query(SMSQueue).join(Contact)
        
        if status:
            query = query.filter(SMSQueue.status == status)
        
        if campaign_id:
            query = query.filter(SMSQueue.campaign_id == campaign_id)
        
        return query.order_by(SMSQueue.created_at.desc()).offset(offset).limit(limit).all()
    
    def reset_for_retry(self, queue_item_id: int) -> bool:
        """
        Reset a queue item for retry.
        
        Args:
            queue_item_id: ID of the queue item to reset
            
        Returns:
            True if successful, False if item not found
        """
        queue_item = self.db.query(SMSQueue).filter(SMSQueue.id == queue_item_id).first()
        
        if not queue_item:
            return False
        
        # Only allow retry for failed items
        if queue_item.status not in ['failed', 'retry_pending']:
            return False
        
        queue_item.status = 'pending'
        queue_item.next_retry_at = None
        queue_item.error_message = None
        
        self.db.commit()
        
        logger.info(f"Reset queue item {queue_item_id} for retry")
        return True
    
    def get_cleanup_preview(self, days: int = 30) -> Dict[str, int]:
        """
        Preview what would be deleted in a cleanup operation.
        
        Args:
            days: Number of days to retain records
            
        Returns:
            Dictionary with counts of what would be deleted
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Count records that would be deleted
        old_sent_count = self.db.query(SMSQueue).filter(
            and_(
                SMSQueue.status == 'sent',
                SMSQueue.processed_at < cutoff_date
            )
        ).count()
        
        old_failed_count = self.db.query(SMSQueue).filter(
            and_(
                SMSQueue.status == 'failed',
                SMSQueue.processed_at < cutoff_date
            )
        ).count()
        
        old_cancelled_count = self.db.query(SMSQueue).filter(
            and_(
                SMSQueue.status == 'cancelled',
                SMSQueue.processed_at < cutoff_date
            )
        ).count()
        
        return {
            'sent_records': old_sent_count,
            'failed_records': old_failed_count,
            'cancelled_records': old_cancelled_count,
            'total_records': old_sent_count + old_failed_count + old_cancelled_count
        }
