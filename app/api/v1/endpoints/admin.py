from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.schemas import activity_log as activity_log_schema
from app.services import audit_service
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_active_admin

router = APIRouter()

# Audit Trail
@router.get("/audit-trail", response_model=List[activity_log_schema.ActivityLog], tags=["admin-audit"])
def get_audit_trail(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Agent = Depends(get_current_active_admin),
):
    logs = audit_service.AuditService.get_audit_logs(db, skip=skip, limit=limit)
    return logs