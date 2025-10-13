from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.schemas import sms as sms_schema
from app.services import sms_service
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_user

router = APIRouter()

@router.get("/queue", response_model=List[sms_schema.SmsQueue])
def read_sms_queue(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Retrieve SMS queue.
    """
    sms_queue = sms_service.get_sms_queue(db, skip=skip, limit=limit)
    return sms_queue