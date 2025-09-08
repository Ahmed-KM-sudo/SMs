import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from typing import List

from app.db.models import ContactList, Contact
from app.api.v1.schemas.contact_list import ContactListCreate, ContactListUpdate, ContactListStatistics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContactListService:
    def __init__(self, db: Session):
        self.db = db

    def get_contact_list(self, list_id: int) -> ContactList | None:
        return self.db.query(ContactList).filter(
            ContactList.id_contact_list == list_id,
            ContactList.deleted_at.is_(None)
        ).first()

    def get_all_contact_lists(self, skip: int = 0, limit: int = 100) -> List[ContactList]:
        return self.db.query(ContactList).filter(ContactList.deleted_at.is_(None)).offset(skip).limit(limit).all()

    def create_contact_list(self, list_data: ContactListCreate) -> ContactList:
        new_list = ContactList(**list_data.model_dump())
        self.db.add(new_list)
        self.db.commit()
        self.db.refresh(new_list)
        return new_list

    def update_contact_list(self, list_id: int, list_data: ContactListUpdate) -> ContactList | None:
        db_list = self.get_contact_list(list_id)
        if not db_list:
            return None

        update_data = list_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_list, key, value)

        self.db.commit()
        self.db.refresh(db_list)
        return db_list

    def soft_delete_contact_list(self, list_id: int) -> ContactList | None:
        db_list = self.get_contact_list(list_id)
        if not db_list:
            return None

        db_list.deleted_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(db_list)
        return db_list

    def get_available_contacts_for_list(self, type_client: str, zone_geographique: str, skip: int = 0, limit: int = 100) -> List[Contact]:
        """Get contacts that match the contact list's type and zone criteria"""
        return self.db.query(Contact).filter(
            Contact.type_client == type_client,
            Contact.zone_geographique == zone_geographique
        ).offset(skip).limit(limit).all()

    def add_contacts_to_list(self, list_id: int, contact_ids: List[int]) -> ContactList | None:
        """Add contacts to a contact list"""
        db_list = self.get_contact_list(list_id)
        if not db_list:
            return None

        # Get contacts that match the list criteria and are in the provided IDs
        contacts = self.db.query(Contact).filter(
            Contact.id_contact.in_(contact_ids),
            Contact.type_client == db_list.type_client,
            Contact.zone_geographique == db_list.zone_geographique
        ).all()

        # Add contacts that aren't already in the list
        existing_contact_ids = {contact.id_contact for contact in db_list.contacts}
        for contact in contacts:
            if contact.id_contact not in existing_contact_ids:
                db_list.contacts.append(contact)

        self.db.commit()
        self.db.refresh(db_list)
        return db_list

    def remove_contacts_from_list(self, list_id: int, contact_ids: List[int]) -> ContactList | None:
        """Remove contacts from a contact list"""
        db_list = self.get_contact_list(list_id)
        if not db_list:
            return None

        # Remove contacts from the list
        db_list.contacts = [contact for contact in db_list.contacts if contact.id_contact not in contact_ids]

        self.db.commit()
        self.db.refresh(db_list)
        return db_list

    def get_contact_list_statistics(self) -> List[ContactListStatistics]:
        """Get statistics for all contact lists"""
        lists = self.get_all_contact_lists()
        statistics = []
        
        for contact_list in lists:
            stats = ContactListStatistics(
                id_contact_list=contact_list.id_contact_list,
                nom_liste=contact_list.nom_liste,
                type_client=contact_list.type_client,
                zone_geographique=contact_list.zone_geographique,
                total_contacts=len(contact_list.contacts),
                created_at=contact_list.created_at
            )
            statistics.append(stats)
        
        return statistics
