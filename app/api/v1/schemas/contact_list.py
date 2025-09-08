from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from .contact import Contact

class ContactListBase(BaseModel):
    nom_liste: str
    type_client: str
    zone_geographique: str

class ContactListCreate(ContactListBase):
    pass

class ContactListUpdate(BaseModel):
    nom_liste: Optional[str] = None
    type_client: Optional[str] = None
    zone_geographique: Optional[str] = None

class ContactList(ContactListBase):
    id_contact_list: int
    contacts: List[Contact] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ContactListStatistics(BaseModel):
    id_contact_list: int
    nom_liste: str
    type_client: str
    zone_geographique: str
    total_contacts: int
    created_at: datetime
