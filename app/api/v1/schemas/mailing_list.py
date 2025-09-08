from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from .contact import Contact  # Assuming a contact schema exists

class ContactFilter(BaseModel):
    segment: Optional[str] = None
    zone_geographique: Optional[str] = None
    type_client: Optional[str] = None
    statut_opt_in: Optional[bool] = None

class MailingListBase(BaseModel):
    nom_liste: str
    description: Optional[str] = None

class MailingListCreate(MailingListBase):
    id_campagne: Optional[int] = None

class MailingListUpdate(BaseModel):
    nom_liste: Optional[str] = None
    description: Optional[str] = None
    id_campagne: Optional[int] = None

class MailingList(MailingListBase):
    id_liste: int
    id_campagne: Optional[int] = None
    contacts: List[Contact] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class BulkContactOperation(BaseModel):
    contact_ids: List[int]

class BulkFilter(BaseModel):
    segment: Optional[str] = None
    zone_geographique: Optional[str] = None
    statut_opt_in: Optional[bool] = None

class BulkOperationRequest(BaseModel):
    filters: BulkFilter

class ListStatistics(BaseModel):
    total_contacts: int
    opt_in_contacts: int
    opt_out_contacts: int
    segments: dict
    zones: dict
    contact_types: dict

class PreviewRequest(BaseModel):
    message_template: str
    sample_size: int = 5

class PreviewContact(BaseModel):
    contact_name: str
    phone_number: str
    personalized_message: str

class PreviewResponse(BaseModel):
    previews: List[PreviewContact]
    total_contacts: int
    estimated_cost: float = 0.0
