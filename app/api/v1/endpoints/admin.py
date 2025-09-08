from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.schemas import user as user_schema
from app.api.v1.schemas.audit import ActivityLog
from app.services import user_service, audit_service
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_active_admin

router = APIRouter()

# User Management
@router.post("/users", response_model=user_schema.User, tags=["admin-users"])
def create_user(
    user: user_schema.UserCreate,
    db: Session = Depends(get_db),
    current_admin: Agent = Depends(get_current_active_admin),
):
    db_user = user_service.get_user_by_username(db, username=user.identifiant)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return user_service.create_user(db=db, user=user, current_admin=current_admin)

@router.get("/users", response_model=List[user_schema.User], tags=["admin-users"])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Agent = Depends(get_current_active_admin),
):
    users = user_service.get_users(db, skip=skip, limit=limit)
    return users

@router.put("/users/{user_id}", response_model=user_schema.User, tags=["admin-users"])
def update_user(
    user_id: int,
    user: user_schema.UserUpdate,
    db: Session = Depends(get_db),
    current_admin: Agent = Depends(get_current_active_admin),
):
    db_user = user_service.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user_service.update_user(db=db, user_id=user_id, user=user)

@router.delete("/users/{user_id}", response_model=user_schema.User, tags=["admin-users"])
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: Agent = Depends(get_current_active_admin),
):
    db_user = user_service.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    # Add audit log for delete
    return user_service.delete_user(db=db, user_id=user_id)

# Audit Trail
@router.get("/audit-trail", response_model=List[ActivityLog], tags=["admin-audit"])
def get_audit_trail(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Agent = Depends(get_current_active_admin),
):
    logs = audit_service.AuditService.get_audit_logs(db, skip=skip, limit=limit)
    return logs
