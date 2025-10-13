from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class SmsQueueBase(BaseModel):
    id_message: int
    date_ajout: datetime
    priorite: int
    statut: str

class SmsQueueInDBBase(SmsQueueBase):
    id_queue: int
    model_config = ConfigDict(from_attributes=True)

class SmsQueue(SmsQueueInDBBase):
    pass