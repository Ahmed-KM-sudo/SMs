from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.schemas import user as user_schema
from app.services import user_service
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_user

router = APIRouter()


@router.get("/me", response_model=user_schema.User)
def read_users_me(current_user: Agent = Depends(get_current_user)):
    """
    Get current user.
    """
    return current_user