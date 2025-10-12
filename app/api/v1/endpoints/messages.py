from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.schemas import message as message_schema
from app.services import message_service
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=List[message_schema.Message])
def read_messages(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Retrieve messages.
    """
    messages = message_service.get_messages(db, skip=skip, limit=limit)
    return messages


@router.get("/campaign/{campaign_id}", response_model=List[message_schema.Message])
def read_messages_by_campaign(
    campaign_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Retrieve messages for a specific campaign.
    """
    messages = message_service.get_messages_by_campaign(db, campaign_id=campaign_id, skip=skip, limit=limit)
    return messages


@router.get("/{message_id}/status", response_model=message_schema.Message)
def get_message_status(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get the status of a specific message.
    """
    db_message = message_service.get_message(db, message_id=message_id)
    if db_message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message


@router.post("/resend/{message_id}", response_model=message_schema.Message)
def resend_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Resend a specific message.
    """
    resent_message = message_service.resend_message(db, message_id=message_id)
    if resent_message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    return resent_message

@router.get("/logs", response_model=List[message_schema.MessageLog])
def read_message_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Retrieve message logs.
    """
    logs = message_service.get_message_logs(db, skip=skip, limit=limit)
    return logs
