from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any


class ActivityLogBase(BaseModel):
    action: str
    table_affected: Optional[str] = None
    record_id: Optional[int] = None
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None


class ActivityLogCreate(ActivityLogBase):
    user_id: int


class ActivityLog(ActivityLogBase):
    id_log: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
