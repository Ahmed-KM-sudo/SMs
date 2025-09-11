import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.db.models import Message, MessageLog, SMSQueue, Contact, Campaign
from app.services.sms_queue_service import SMSQueueService

logger = logging.getLogger(__name__)

class MessageLoggingService:
    """
    Comprehensive message logging service for tracking SMS delivery lifecycle.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.queue_service = SMSQueueService(db)
    
    def create_message_record(
        self,
        queue_item: SMSQueue,
        initial_status: str = 'pending',
        external_message_id: Optional[str] = None
    ) -> Message:
        """
        Create a message record when processing starts.
        
        Args:
            queue_item: The queue item being processed
            initial_status: Initial status of the message
            external_message_id: External ID from SMS provider
            
        Returns:
            Created Message record
        """
        message = Message(
            contenu=queue_item.message_content,
            date_envoi=datetime.now(timezone.utc),
            statut_livraison=initial_status,
            identifiant_expediteur=self._get_sender_identifier(),
            external_message_id=external_message_id,
            delivery_attempts=1,
            id_liste=self._get_mailing_list_id(queue_item),
            id_contact=queue_item.contact_id,
            id_campagne=queue_item.campaign_id,
            queue_item_id=queue_item.id
        )
        
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        
        # Create initial log entry
        self.log_message_event(
            message=message,
            status=initial_status,
            event_type='message_created',
            queue_item_id=queue_item.id
        )
        
        logger.info(f"Created message record {message.id_message} for queue item {queue_item.id}")
        return message
    
    def log_message_event(
        self,
        message: Message,
        status: str,
        event_type: str,
        provider_status: Optional[str] = None,
        provider_response: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None,
        error_message: Optional[str] = None,
        external_message_id: Optional[str] = None,
        cost: Optional[float] = None,
        processing_duration: Optional[int] = None,
        queue_item_id: Optional[int] = None
    ) -> MessageLog:
        """
        Log a message event with comprehensive details.
        
        Args:
            message: The message record
            status: Current status of the message
            event_type: Type of event (sent, delivered, failed, etc.)
            provider_status: Raw status from SMS provider
            provider_response: Full response from provider
            error_code: Error code if applicable
            error_message: Error message if applicable
            external_message_id: Provider message ID
            cost: Cost of sending this message
            processing_duration: Time taken to process in milliseconds
            queue_item_id: Related queue item ID
            
        Returns:
            Created MessageLog record
        """
        # Get current attempt number
        attempt_number = self.db.query(MessageLog).filter(
            MessageLog.message_id == message.id_message
        ).count() + 1
        
        log_entry = MessageLog(
            message_id=message.id_message,
            queue_item_id=queue_item_id,
            status=status,
            provider_status=provider_status,
            provider_response=provider_response or {},
            error_code=error_code,
            error_message=error_message,
            attempt_number=attempt_number,
            external_message_id=external_message_id,
            cost=cost,
            processing_duration=processing_duration
        )
        
        self.db.add(log_entry)
        
        # Update message record with latest information
        message.statut_livraison = status
        message.delivery_attempts = attempt_number
        message.updated_at = datetime.now(timezone.utc)
        
        if external_message_id:
            message.external_message_id = external_message_id
        
        if error_message:
            message.error_message = error_message
        
        if cost:
            message.cost = cost
        
        # Set final status and delivery timestamp for terminal states
        if status in ['delivered', 'failed', 'bounced']:
            message.final_status = status
            if status == 'delivered':
                message.delivery_timestamp = datetime.now(timezone.utc)
        
        self.db.commit()
        self.db.refresh(log_entry)
        
        logger.info(f"Logged event for message {message.id_message}: {status} (attempt {attempt_number})")
        return log_entry
    
    def update_delivery_status(
        self,
        external_message_id: str,
        provider_status: str,
        provider_response: Dict[str, Any],
        webhook_data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Update message delivery status based on provider webhook or status check.
        
        Args:
            external_message_id: Provider message ID
            provider_status: Status from provider
            provider_response: Full response from provider
            webhook_data: Additional webhook data
            
        Returns:
            True if message was found and updated, False otherwise
        """
        # Find message by external ID
        message = self.db.query(Message).filter(
            Message.external_message_id == external_message_id
        ).first()
        
        if not message:
            logger.warning(f"Message not found for external ID: {external_message_id}")
            return False
        
        # Map provider status to our internal status
        internal_status = self._map_provider_status(provider_status)
        
        # Extract cost and error information from response
        cost = self._extract_cost_from_response(provider_response)
        error_code = provider_response.get('error_code')
        error_message = provider_response.get('error_message')
        
        # Log the delivery update
        self.log_message_event(
            message=message,
            status=internal_status,
            event_type='delivery_update',
            provider_status=provider_status,
            provider_response=provider_response,
            error_code=error_code,
            error_message=error_message,
            cost=cost
        )
        
        logger.info(f"Updated delivery status for message {message.id_message}: {internal_status}")
        return True
    
    def get_message_timeline(self, message_id: int) -> List[Dict[str, Any]]:
        """
        Get complete timeline of events for a message.
        
        Args:
            message_id: ID of the message
            
        Returns:
            List of timeline events
        """
        logs = self.db.query(MessageLog).filter(
            MessageLog.message_id == message_id
        ).order_by(MessageLog.created_at.asc()).all()
        
        timeline = []
        for log in logs:
            timeline.append({
                'id': log.id,
                'timestamp': log.created_at,
                'status': log.status,
                'provider_status': log.provider_status,
                'attempt_number': log.attempt_number,
                'error_code': log.error_code,
                'error_message': log.error_message,
                'external_message_id': log.external_message_id,
                'cost': float(log.cost) if log.cost else None,
                'processing_duration': log.processing_duration,
                'provider_response': log.provider_response
            })
        
        return timeline
    
    def get_campaign_message_stats(self, campaign_id: int) -> Dict[str, Any]:
        """
        Get comprehensive message statistics for a campaign.
        
        Args:
            campaign_id: ID of the campaign
            
        Returns:
            Dictionary with campaign message statistics
        """
        # Get message counts by status
        messages = self.db.query(Message).filter(
            Message.id_campagne == campaign_id
        ).all()
        
        stats = {
            'total_messages': len(messages),
            'status_breakdown': {},
            'delivery_rate': 0.0,
            'average_delivery_time': 0.0,
            'total_cost': 0.0,
            'retry_rate': 0.0,
            'error_summary': {}
        }
        
        if not messages:
            return stats
        
        # Calculate status breakdown
        for message in messages:
            status = message.final_status or message.statut_livraison
            stats['status_breakdown'][status] = stats['status_breakdown'].get(status, 0) + 1
        
        # Calculate delivery rate
        delivered_count = stats['status_breakdown'].get('delivered', 0)
        stats['delivery_rate'] = (delivered_count / len(messages)) * 100
        
        # Calculate average delivery time for delivered messages
        delivered_messages = [m for m in messages if m.delivery_timestamp]
        if delivered_messages:
            total_delivery_time = sum([
                (m.delivery_timestamp - m.date_envoi).total_seconds()
                for m in delivered_messages
            ])
            stats['average_delivery_time'] = total_delivery_time / len(delivered_messages)
        
        # Calculate total cost
        stats['total_cost'] = sum([float(m.cost) for m in messages if m.cost])
        
        # Calculate retry rate
        retried_messages = [m for m in messages if m.delivery_attempts > 1]
        stats['retry_rate'] = (len(retried_messages) / len(messages)) * 100
        
        # Get error summary
        error_logs = self.db.query(MessageLog).join(Message).filter(
            and_(
                Message.id_campagne == campaign_id,
                MessageLog.error_code.isnot(None)
            )
        ).all()
        
        for log in error_logs:
            error_key = f"{log.error_code}: {log.error_message}"
            stats['error_summary'][error_key] = stats['error_summary'].get(error_key, 0) + 1
        
        return stats
    
    def get_failed_messages_for_retry(self, campaign_id: Optional[int] = None, limit: int = 100) -> List[Message]:
        """
        Get failed messages that might be eligible for retry.
        
        Args:
            campaign_id: Optional campaign ID to filter by
            limit: Maximum number of messages to return
            
        Returns:
            List of failed Message records
        """
        query = self.db.query(Message).filter(
            Message.statut_livraison == 'failed'
        )
        
        if campaign_id:
            query = query.filter(Message.id_campagne == campaign_id)
        
        return query.order_by(desc(Message.updated_at)).limit(limit).all()
    
    def _get_sender_identifier(self) -> str:
        """Get sender identifier (phone number or service name)."""
        from app.core.config import settings
        return getattr(settings, 'TWILIO_PHONE_NUMBER', 'SMS-PLATFORM')
    
    def _get_mailing_list_id(self, queue_item: SMSQueue) -> Optional[int]:
        """Get mailing list ID for the queue item."""
        # This might need to be enhanced based on your business logic
        campaign = self.db.query(Campaign).filter(
            Campaign.id_campagne == queue_item.campaign_id
        ).first()
        
        if campaign and campaign.mailing_lists:
            return campaign.mailing_lists[0].id_liste
        
        return None
    
    def _map_provider_status(self, provider_status: str) -> str:
        """Map provider-specific status to internal status."""
        # Twilio status mapping
        twilio_mapping = {
            'queued': 'sent',
            'sending': 'sent',
            'sent': 'sent',
            'delivered': 'delivered',
            'failed': 'failed',
            'undelivered': 'failed',
            'read': 'delivered',  # For platforms that support read receipts
        }
        
        return twilio_mapping.get(provider_status.lower(), provider_status)
    
    def _extract_cost_from_response(self, provider_response: Dict[str, Any]) -> Optional[float]:
        """Extract cost information from provider response."""
        # This would need to be customized based on your provider
        price = provider_response.get('price')
        if price:
            try:
                return float(price)
            except (ValueError, TypeError):
                pass
        
        return None
