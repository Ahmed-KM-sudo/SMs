from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any

class ActivityLogBase(BaseModel):
    user_id: Optional[int] = None
    action: str
    table_affected: Optional[str] = None
    record_id: Optional[int] = None
    old_values: Optional[dict] = None
    new_values: Optional[dict] = None
    ip_address: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLog(ActivityLogBase):
    id_log: int
    timestamp: datetime

    class Config:
        from_attributes = True