import logging
import time
from datetime import datetime, timezone
from app.core.celery_app import celery_app
from app.core.config import settings
from app.db.models import SMSQueue, Message, Campaign
from app.db.session import SessionLocal
from app.services.campaign_execution_service import CampaignExecutionService
from app.services.sms_queue_service import SMSQueueService
from app.services.message_logging_service import MessageLoggingService
from app.services.sms_providers.twilio_provider import TwilioProvider, TwilioApiError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_SEND_ATTEMPTS = 3

def _is_permanent_twilio_error(error: TwilioApiError) -> bool:
    """
    Determine if a Twilio error is permanent and should not be retried.
    """
    # Permanent error codes that should not be retried
    permanent_error_codes = {
        '21211',  # Invalid 'To' Phone Number
        '21214',  # 'To' phone number cannot be reached
        '21408',  # Permission to send an SMS has not been enabled
        '21610',  # Message cannot be sent to unsubscribed recipient
        '30007',  # Message Delivery - Message filtered
        '30008',  # Message Delivery - Message not delivered
    }
    
    error_code = getattr(error, 'code', None)
    return error_code in permanent_error_codes

@celery_app.task
def send_scheduled_campaigns():
    """
    Checks for campaigns that are scheduled to be sent and launches them.
    """
    db = SessionLocal()
    campaign_execution_service = CampaignExecutionService(db)
    try:
        scheduled_campaigns = db.query(Campaign).filter(
            Campaign.statut == 'scheduled',
            Campaign.date_debut <= datetime.now(timezone.utc)
        ).all()

        if not scheduled_campaigns:
            logger.info("No scheduled campaigns to launch.")
            return

        logger.info(f"Found {len(scheduled_campaigns)} scheduled campaigns to launch.")
        for campaign in scheduled_campaigns:
            try:
                logger.info(f"Auto-launching scheduled campaign {campaign.id_campagne}.")
                campaign_execution_service.launch_campaign(campaign.id_campagne)
            except Exception as e:
                logger.error(f"Failed to auto-launch campaign {campaign.id_campagne}: {e}")
    finally:
        db.close()

@celery_app.task
def process_sms_batch():
    """
    Enhanced SMS batch processor using queue and logging services.
    Processes pending messages with comprehensive logging and error handling.
    """
    db = SessionLocal()
    provider = TwilioProvider()
    queue_service = SMSQueueService(db)
    logging_service = MessageLoggingService(db)

    try:
        # Determine batch size from settings
        DEFAULT_BATCH_SIZE = 100
        batch_size = DEFAULT_BATCH_SIZE
        if hasattr(settings, 'SMS_RATE_LIMIT') and settings.SMS_RATE_LIMIT:
            try:
                parsed_limit = int(settings.SMS_RATE_LIMIT)
                if parsed_limit > 0:
                    batch_size = parsed_limit
                else:
                    logger.warning(f"SMS_RATE_LIMIT must be positive, got '{settings.SMS_RATE_LIMIT}'. Using default {DEFAULT_BATCH_SIZE}.")
            except (ValueError, TypeError):
                logger.warning(f"Invalid SMS_RATE_LIMIT: '{settings.SMS_RATE_LIMIT}'. Using default {DEFAULT_BATCH_SIZE}.")

        # Get pending messages using queue service
        pending_items = queue_service.get_pending_messages(limit=batch_size)

        if not pending_items:
            return {"status": "success", "processed": 0}

        logger.info(f"Processing {len(pending_items)} messages from the queue.")
        
        processed_count = 0
        success_count = 0
        failed_count = 0

        for item in pending_items:
            start_time = time.time()
            
            try:
                # Mark as processing
                queue_service.mark_processing(item.id)
                
                # Create initial message record
                message = logging_service.create_message_record(
                    queue_item=item,
                    initial_status='processing'
                )
                
                # Construct callback URL for delivery status updates
                callback_url = f"{getattr(settings, 'BASE_URL', 'http://localhost:8000')}/api/v1/webhooks/sms/status/{message.id_message}"

                # Send SMS using provider
                response = provider.send_sms(
                    to_number=item.contact.numero_telephone,
                    message=item.message_content,
                    callback_url=callback_url
                )
                
                processing_duration = int((time.time() - start_time) * 1000)  # milliseconds
                
                # Extract response details
                external_message_id = response.get("sid")
                provider_status = response.get("status", "unknown")
                cost = response.get("price")
                
                # Map provider status to internal status
                if provider_status in ['queued', 'sending']:
                    internal_status = 'sent'
                elif provider_status == 'delivered':
                    internal_status = 'delivered'
                elif provider_status in ['failed', 'undelivered']:
                    internal_status = 'failed'
                else:
                    internal_status = 'sent'  # Default to sent for unknown statuses
                
                # Log successful send
                logging_service.log_message_event(
                    message=message,
                    status=internal_status,
                    event_type='sent',
                    provider_status=provider_status,
                    provider_response=response,
                    external_message_id=external_message_id,
                    cost=float(cost) if cost else None,
                    processing_duration=processing_duration,
                    queue_item_id=item.id
                )
                
                # Mark queue item as sent
                queue_service.mark_sent(
                    queue_item_id=item.id,
                    external_message_id=external_message_id,
                    provider_response=response
                )
                
                success_count += 1
                logger.info(f"Successfully sent message from queue item {item.id} (external ID: {external_message_id})")

            except TwilioApiError as e:
                processing_duration = int((time.time() - start_time) * 1000)
                
                # Log the API error
                error_response = {
                    "error_code": getattr(e, 'code', 'TWILIO_API_ERROR'),
                    "error_message": str(e),
                    "details": getattr(e, 'details', {})
                }
                
                # Determine if this is a permanent failure or should be retried
                is_permanent_failure = _is_permanent_twilio_error(e)
                
                if hasattr(locals(), 'message'):
                    # Log the failure
                    logging_service.log_message_event(
                        message=message,
                        status='failed' if is_permanent_failure else 'retry_pending',
                        event_type='send_failed',
                        provider_status='error',
                        provider_response=error_response,
                        error_code=getattr(e, 'code', 'TWILIO_API_ERROR'),
                        error_message=str(e),
                        processing_duration=processing_duration,
                        queue_item_id=item.id
                    )
                
                # Handle queue item based on error type
                if is_permanent_failure:
                    queue_service.mark_failed(
                        queue_item_id=item.id,
                        error_message=str(e),
                        is_permanent=True
                    )
                else:
                    # Schedule for retry
                    queue_service.mark_failed(
                        queue_item_id=item.id,
                        error_message=str(e),
                        is_permanent=False
                    )
                
                failed_count += 1
                logger.error(f"Twilio API error for queue item {item.id}: {e}")

            except Exception as e:
                processing_duration = int((time.time() - start_time) * 1000)
                
                error_response = {
                    "error_code": "INTERNAL_ERROR",
                    "error_message": str(e)
                }
                
                if hasattr(locals(), 'message'):
                    # Log the unexpected error
                    logging_service.log_message_event(
                        message=message,
                        status='failed',
                        event_type='send_failed',
                        provider_status='error',
                        provider_response=error_response,
                        error_code='INTERNAL_ERROR',
                        error_message=str(e),
                        processing_duration=processing_duration,
                        queue_item_id=item.id
                    )
                
                # Mark as permanent failure for unexpected errors
                queue_service.mark_failed(
                    queue_item_id=item.id,
                    error_message=str(e),
                    is_permanent=True
                )
                
                failed_count += 1
                logger.error(f"Unexpected error processing queue item {item.id}: {e}")
            
            processed_count += 1

        logger.info(f"Batch processing complete: {processed_count} processed, {success_count} sent, {failed_count} failed")
        
        return {
            "status": "success",
            "processed": processed_count,
            "sent": success_count,
            "failed": failed_count
        }

    except Exception as e:
        logger.error(f"Critical error in process_sms_batch: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=300)
def retry_failed_messages(self):
    """
    Enhanced retry logic for failed messages using queue service.
    Handles exponential backoff and permanent failure detection.
    """
    db = SessionLocal()
    queue_service = SMSQueueService(db)
    
    try:
        # Get messages eligible for retry
        retry_items = queue_service.get_messages_for_retry()
        
        if not retry_items:
            logger.info("No messages eligible for retry.")
            return {"status": "success", "retried": 0}
        
        logger.info(f"Found {len(retry_items)} messages eligible for retry.")
        
        retried_count = 0
        for item in retry_items:
            try:
                # Reset for retry
                queue_service.reset_for_retry(item.id)
                retried_count += 1
                logger.info(f"Reset message {item.id} for retry (attempt {item.attempts + 1})")
                
            except Exception as e:
                logger.error(f"Failed to reset message {item.id} for retry: {e}")
        
        logger.info(f"Successfully reset {retried_count} messages for retry.")
        
        return {
            "status": "success", 
            "retried": retried_count,
            "total_found": len(retry_items)
        }
        
    except Exception as exc:
        logger.error(f"Error during retry_failed_messages task: {exc}")
        raise self.retry(exc=exc)
    finally:
        db.close()


@celery_app.task
def cleanup_old_messages():
    """
    Enhanced cleanup task using queue service.
    Removes old processed messages and logs based on retention settings.
    """
    db = SessionLocal()
    queue_service = SMSQueueService(db)
    
    try:
        # Get retention settings (default to 30 days)
        retention_days = getattr(settings, 'MESSAGE_RETENTION_DAYS', 30)
        
        # Cleanup old queue records
        cleanup_stats = queue_service.cleanup_old_records(days=retention_days)
        
        logger.info(f"Cleanup completed: {cleanup_stats}")
        
        return {
            "status": "success",
            "cleanup_stats": cleanup_stats
        }
        
    except Exception as e:
        logger.error(f"Error during cleanup_old_messages task: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@celery_app.task
def generate_campaign_reports():
    """
    Enhanced report generation using message logging service.
    Generates comprehensive campaign analytics and delivery reports.
    """
    db = SessionLocal()
    logging_service = MessageLoggingService(db)
    
    try:
        # Get recent campaigns for reporting
        recent_campaigns = db.query(Campaign).filter(
            Campaign.date_creation >= datetime.now(timezone.utc).replace(day=1)  # This month
        ).all()
        
        reports_generated = 0
        
        for campaign in recent_campaigns:
            try:
                # Generate comprehensive stats
                stats = logging_service.get_campaign_message_stats(campaign.id_campagne)
                
                # Here you could save the report to database, send email, etc.
                logger.info(f"Generated report for campaign {campaign.id_campagne}: {stats}")
                reports_generated += 1
                
            except Exception as e:
                logger.error(f"Failed to generate report for campaign {campaign.id_campagne}: {e}")
        
        logger.info(f"Generated {reports_generated} campaign reports.")
        
        return {
            "status": "success",
            "reports_generated": reports_generated,
            "total_campaigns": len(recent_campaigns)
        }
        
    except Exception as e:
        logger.error(f"Error during generate_campaign_reports task: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@celery_app.task
def check_delivery_status():
    """
    New task to check delivery status of sent messages.
    Queries SMS provider for delivery updates on recent messages.
    """
    db = SessionLocal()
    provider = TwilioProvider()
    logging_service = MessageLoggingService(db)
    
    try:
        # Get messages that are in 'sent' status and might have delivery updates
        cutoff_time = datetime.now(timezone.utc).replace(hour=datetime.now().hour - 24)  # Last 24 hours
        
        pending_messages = db.query(Message).filter(
            Message.statut_livraison == 'sent',
            Message.date_envoi >= cutoff_time,
            Message.external_message_id.isnot(None)
        ).all()
        
        if not pending_messages:
            logger.info("No pending messages to check delivery status.")
            return {"status": "success", "checked": 0}
        
        logger.info(f"Checking delivery status for {len(pending_messages)} messages.")
        
        updated_count = 0
        
        for message in pending_messages:
            try:
                # Query provider for current status
                status_response = provider.get_message_status(message.external_message_id)
                
                if status_response and status_response.get('status'):
                    # Update status if it has changed
                    provider_status = status_response.get('status')
                    
                    if provider_status != message.statut_livraison:
                        logging_service.update_delivery_status(
                            external_message_id=message.external_message_id,
                            provider_status=provider_status,
                            provider_response=status_response
                        )
                        updated_count += 1
                        
            except Exception as e:
                logger.error(f"Failed to check status for message {message.id_message}: {e}")
        
        logger.info(f"Updated delivery status for {updated_count} messages.")
        
        return {
            "status": "success",
            "checked": len(pending_messages),
            "updated": updated_count
        }
        
    except Exception as e:
        logger.error(f"Error during check_delivery_status task: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
