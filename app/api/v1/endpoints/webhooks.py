import logging
from fastapi import APIRouter, Depends, Request, Form, HTTPException, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import Annotated

from app.db.session import get_db
from app.services.webhook_service import WebhookService
from app.services.message_logging_service import MessageLoggingService

logger = logging.getLogger(__name__)

router = APIRouter()

async def validate_twilio_request(request: Request, db: Session = Depends(get_db)):
    """Dependency to validate incoming Twilio webhooks."""
    try:
        raw_body = await request.body()
        webhook_service = WebhookService(db)
        # The URL passed to the validator must match what Twilio requested
        # including any query parameters.
        webhook_service.validate_webhook_signature(request, raw_body)
    except HTTPException as e:
        raise e # Re-raise the validation exception
    except Exception as e:
        # Catch any other exceptions during validation
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error during webhook validation")
    return raw_body


@router.post("/sms/delivery", response_class=PlainTextResponse)
async def sms_delivery_webhook(
    request: Request,
    db: Session = Depends(get_db),
    # Validate webhook signature
    _=Depends(validate_twilio_request),
):
    """
    Enhanced SMS delivery status webhook handler.
    Uses the new message logging service for comprehensive tracking.
    """
    try:
        payload = await request.form()
        payload_dict = dict(payload)
        
        logger.info(f"Received SMS delivery webhook: {payload_dict}")
        
        # Extract webhook data
        external_message_id = payload_dict.get('MessageSid') or payload_dict.get('SmsSid')
        provider_status = payload_dict.get('MessageStatus') or payload_dict.get('SmsStatus')
        
        if not external_message_id or not provider_status:
            logger.warning(f"Incomplete webhook data: {payload_dict}")
            return PlainTextResponse("Missing required fields", status_code=400)
        
        # Use both services for comprehensive logging
        webhook_service = WebhookService(db)
        logging_service = MessageLoggingService(db)
        
        # Handle with original service (for compatibility)
        webhook_service.handle_delivery_status(payload_dict)
        
        # Enhanced logging with new service
        success = logging_service.update_delivery_status(
            external_message_id=external_message_id,
            provider_status=provider_status,
            provider_response=payload_dict,
            webhook_data=payload_dict
        )
        
        if success:
            logger.info(f"Successfully processed webhook for message {external_message_id}: {provider_status}")
        else:
            logger.warning(f"Message not found for external ID: {external_message_id}")
        
        return PlainTextResponse("OK", status_code=200)
        
    except Exception as e:
        logger.error(f"Error processing SMS delivery webhook: {e}")
        return PlainTextResponse("Internal server error", status_code=500)

@router.post("/sms/status/{message_id}", response_class=PlainTextResponse)
async def message_status_webhook(
    message_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Direct message status webhook for specific message IDs.
    Bypasses signature validation for internal use.
    """
    try:
        webhook_data = await request.form()
        webhook_dict = dict(webhook_data)
        
        logger.info(f"Received status webhook for message {message_id}: {webhook_dict}")
        
        external_message_id = webhook_dict.get('MessageSid') or webhook_dict.get('SmsSid')
        provider_status = webhook_dict.get('MessageStatus') or webhook_dict.get('SmsStatus')
        
        if not provider_status:
            return PlainTextResponse("Missing status", status_code=400)
        
        logging_service = MessageLoggingService(db)
        
        success = logging_service.update_delivery_status(
            external_message_id=external_message_id or f"internal_{message_id}",
            provider_status=provider_status,
            provider_response=webhook_dict,
            webhook_data=webhook_dict
        )
        
        return PlainTextResponse("OK" if success else "Message not found", 
                               status_code=200 if success else 404)
        
    except Exception as e:
        logger.error(f"Error processing message status webhook: {e}")
        return PlainTextResponse("Internal server error", status_code=500)

@router.get("/test")
async def test_webhook_endpoint():
    """Test endpoint to verify webhook connectivity."""
    return {"status": "ok", "message": "Webhook endpoints are responding"}
