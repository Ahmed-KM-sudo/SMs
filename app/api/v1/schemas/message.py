from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class MessageBase(BaseModel):
    contenu: str
    date_envoi: datetime
    statut_livraison: str
    identifiant_expediteur: str
    external_message_id: Optional[str] = None
    error_message: Optional[str] = None
    cost: Optional[float] = None

class MessageInDBBase(MessageBase):
    id_message: int
    id_liste: int
    id_contact: int
    id_campagne: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Message(MessageInDBBase):
    pass

class MessageLogBase(BaseModel):
    id_message: int
    log_time: datetime
    statut_message: str
    notes: Optional[str] = None

class MessageLogInDBBase(MessageLogBase):
    id_log: int
    model_config = ConfigDict(from_attributes=True)

class MessageLog(MessageLogInDBBase):
    pass
