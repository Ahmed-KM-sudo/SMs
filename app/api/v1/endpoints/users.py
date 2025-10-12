from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.schemas import user as user_schema
from app.services import user_service
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_active_admin, get_current_user

router = APIRouter()


@router.post("/", response_model=user_schema.User)
def create_user(
    user: user_schema.UserCreate,
    db: Session = Depends(get_db),
    current_admin: Agent = Depends(get_current_active_admin),
):
    """
    Create a new user.
    """
    db_user = user_service.get_user_by_username(db, username=user.identifiant)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return user_service.create_user(db=db, user=user, current_admin=current_admin)


@router.get("/", response_model=List[user_schema.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Agent = Depends(get_current_active_admin),
):
    """
    Retrieve users.
    """
    users = user_service.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/me", response_model=user_schema.User)
def read_users_me(current_user: Agent = Depends(get_current_user)):
    """
    Get current user.
    """
    return current_user


@router.get("/{user_id}", response_model=user_schema.User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: Agent = Depends(get_current_active_admin),
):
    """
    Get user by ID.
    """
    db_user = user_service.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.put("/{user_id}", response_model=user_schema.User)
def update_user(
    user_id: int,
    user: user_schema.UserUpdate,
    db: Session = Depends(get_db),
    current_admin: Agent = Depends(get_current_active_admin),
):
    """
    Update a user.
    """
    db_user = user_service.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_service.update_user(db=db, user_id=user_id, user=user, current_admin=current_admin)


@router.delete("/{user_id}", response_model=user_schema.User)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: Agent = Depends(get_current_active_admin),
):
    """
    Delete a user.
    """
    db_user = user_service.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_service.delete_user(db=db, user_id=user_id, current_admin=current_admin)
