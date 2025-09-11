import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.services.sms_queue_service import SMSQueueService
from app.services.message_logging_service import MessageLoggingService
from app.core.security import get_current_user
from app.db.models import Agent

logger = logging.getLogger(__name__)

router = APIRouter()

# Response models
class QueueStatsResponse(BaseModel):
    total_pending: int
    total_processing: int
    total_sent: int
    total_failed: int
    total_cancelled: int
    average_processing_time: float
    success_rate: float
    retry_rate: float

class QueueItemResponse(BaseModel):
    id: int
    campaign_id: Optional[int]
    contact_id: int
    contact_phone: str
    message_content: str
    status: str
    priority: int
    attempts: int
    max_attempts: int
    created_at: datetime
    scheduled_at: Optional[datetime]
    processed_at: Optional[datetime]
    next_retry_at: Optional[datetime]
    error_message: Optional[str]
    external_message_id: Optional[str]

class MessageTimelineResponse(BaseModel):
    message_id: int
    events: List[Dict[str, Any]]

class CampaignStatsResponse(BaseModel):
    campaign_id: int
    total_messages: int
    status_breakdown: Dict[str, int]
    delivery_rate: float
    average_delivery_time: float
    total_cost: float
    retry_rate: float
    error_summary: Dict[str, int]

@router.get("/stats", response_model=QueueStatsResponse)
async def get_queue_stats(
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    """
    Get comprehensive SMS queue statistics.
    Requires authentication.
    """
    try:
        queue_service = SMSQueueService(db)
        stats = queue_service.get_queue_stats()
        
        return QueueStatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Error fetching queue stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch queue statistics"
        )

@router.get("/items", response_model=List[QueueItemResponse])
async def get_queue_items(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    campaign_id: Optional[int] = Query(None, description="Filter by campaign ID"),
    limit: int = Query(100, ge=1, le=1000, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    """
    Get queue items with optional filtering.
    Supports pagination and filtering by status and campaign.
    """
    try:
        queue_service = SMSQueueService(db)
        
        # Get items based on filters
        if status_filter == 'pending':
            items = queue_service.get_pending_messages(limit=limit, offset=offset)
        elif status_filter == 'retry':
            items = queue_service.get_messages_for_retry(limit=limit, offset=offset)
        else:
            # Get all items with optional filters
            items = queue_service.get_queue_items(
                status=status_filter,
                campaign_id=campaign_id,
                limit=limit,
                offset=offset
            )
        
        # Convert to response format
        response_items = []
        for item in items:
            response_items.append(QueueItemResponse(
                id=item.id,
                campaign_id=item.campaign_id,
                contact_id=item.contact_id,
                contact_phone=item.contact.numero_telephone,
                message_content=item.message_content,
                status=item.status,
                priority=item.priority,
                attempts=item.attempts,
                max_attempts=item.max_attempts,
                created_at=item.created_at,
                scheduled_at=item.scheduled_at,
                processed_at=item.processed_at,
                next_retry_at=item.next_retry_at,
                error_message=item.error_message,
                external_message_id=item.external_message_id
            ))
        
        return response_items
        
    except Exception as e:
        logger.error(f"Error fetching queue items: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch queue items"
        )

@router.post("/items/{item_id}/cancel")
async def cancel_queue_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    """
    Cancel a pending queue item.
    Only pending and retry_pending items can be cancelled.
    """
    try:
        queue_service = SMSQueueService(db)
        
        success = queue_service.cancel_message(
            queue_item_id=item_id,
            reason=f"Cancelled by user {current_user.nom_utilisateur}"
        )
        
        if success:
            return {"status": "success", "message": f"Queue item {item_id} cancelled"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Queue item not found or cannot be cancelled"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling queue item {item_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel queue item"
        )

@router.post("/items/{item_id}/retry")
async def retry_queue_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    """
    Manually retry a failed queue item.
    Resets the item for immediate processing.
    """
    try:
        queue_service = SMSQueueService(db)
        
        success = queue_service.reset_for_retry(item_id)
        
        if success:
            return {"status": "success", "message": f"Queue item {item_id} reset for retry"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Queue item not found or cannot be retried"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrying queue item {item_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retry queue item"
        )

@router.get("/messages/{message_id}/timeline", response_model=MessageTimelineResponse)
async def get_message_timeline(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    """
    Get complete timeline of events for a specific message.
    Shows all status changes, attempts, and delivery updates.
    """
    try:
        logging_service = MessageLoggingService(db)
        
        timeline = logging_service.get_message_timeline(message_id)
        
        return MessageTimelineResponse(
            message_id=message_id,
            events=timeline
        )
        
    except Exception as e:
        logger.error(f"Error fetching message timeline for {message_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch message timeline"
        )

@router.get("/campaigns/{campaign_id}/stats", response_model=CampaignStatsResponse)
async def get_campaign_message_stats(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    """
    Get comprehensive message statistics for a specific campaign.
    Includes delivery rates, costs, errors, and timing information.
    """
    try:
        logging_service = MessageLoggingService(db)
        
        stats = logging_service.get_campaign_message_stats(campaign_id)
        
        return CampaignStatsResponse(
            campaign_id=campaign_id,
            **stats
        )
        
    except Exception as e:
        logger.error(f"Error fetching campaign stats for {campaign_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch campaign statistics"
        )

@router.get("/failed-messages")
async def get_failed_messages_for_retry(
    campaign_id: Optional[int] = Query(None, description="Filter by campaign ID"),
    limit: int = Query(100, ge=1, le=1000, description="Number of messages to return"),
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    """
    Get failed messages that might be eligible for retry.
    Useful for manual intervention and bulk retry operations.
    """
    try:
        logging_service = MessageLoggingService(db)
        
        failed_messages = logging_service.get_failed_messages_for_retry(
            campaign_id=campaign_id,
            limit=limit
        )
        
        # Convert to simple response format
        response = []
        for message in failed_messages:
            response.append({
                "id": message.id_message,
                "campaign_id": message.id_campagne,
                "contact_id": message.id_contact,
                "content": message.contenu,
                "status": message.statut_livraison,
                "attempts": message.delivery_attempts,
                "last_error": message.error_message,
                "date_sent": message.date_envoi,
                "updated_at": message.updated_at
            })
        
        return {
            "failed_messages": response,
            "total_count": len(response),
            "campaign_id": campaign_id
        }
        
    except Exception as e:
        logger.error(f"Error fetching failed messages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch failed messages"
        )

@router.post("/cleanup")
async def trigger_cleanup(
    days: int = Query(30, ge=1, le=365, description="Number of days to retain"),
    dry_run: bool = Query(False, description="Preview what would be deleted"),
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    """
    Trigger cleanup of old queue records and message logs.
    Supports dry-run mode to preview what would be deleted.
    """
    try:
        queue_service = SMSQueueService(db)
        
        if dry_run:
            # Get counts without actually deleting
            stats = queue_service.get_cleanup_preview(days=days)
            return {
                "status": "preview",
                "days": days,
                "would_delete": stats
            }
        else:
            # Perform actual cleanup
            stats = queue_service.cleanup_old_records(days=days)
            return {
                "status": "completed",
                "days": days,
                "deleted": stats
            }
        
    except Exception as e:
        logger.error(f"Error during cleanup operation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform cleanup operation"
        )

@router.get("/health")
async def queue_health_check(
    db: Session = Depends(get_db)
):
    """
    Health check endpoint for queue system.
    Provides basic status without authentication requirement.
    """
    try:
        queue_service = SMSQueueService(db)
        
        # Get basic health metrics
        stats = queue_service.get_queue_stats()
        
        # Determine health status
        health_status = "healthy"
        warnings = []
        
        # Check for concerning conditions
        if stats.get('total_pending', 0) > 10000:
            warnings.append("High pending message count")
            health_status = "warning"
        
        if stats.get('success_rate', 100) < 90:
            warnings.append("Low success rate")
            health_status = "warning"
        
        if stats.get('total_processing', 0) > 1000:
            warnings.append("High processing message count")
            health_status = "warning"
        
        return {
            "status": health_status,
            "timestamp": datetime.now(timezone.utc),
            "pending_messages": stats.get('total_pending', 0),
            "processing_messages": stats.get('total_processing', 0),
            "success_rate": stats.get('success_rate', 0),
            "warnings": warnings
        }
        
    except Exception as e:
        logger.error(f"Error during health check: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "error": "Database connection failed"
            }
        )
