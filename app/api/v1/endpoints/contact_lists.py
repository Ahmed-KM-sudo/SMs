from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_user
from app.services.contact_list_service import ContactListService
from app.api.v1.schemas import contact_list as list_schema
from app.api.v1.schemas.contact import Contact

router = APIRouter()

@router.post("/", response_model=list_schema.ContactList, status_code=status.HTTP_201_CREATED)
def create_contact_list(
    list_data: list_schema.ContactListCreate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = ContactListService(db)
    return service.create_contact_list(list_data=list_data)

@router.get("/", response_model=List[list_schema.ContactList])
def get_all_contact_lists(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = ContactListService(db)
    return service.get_all_contact_lists(skip=skip, limit=limit)

@router.get("/statistics", response_model=List[list_schema.ContactListStatistics])
def get_contact_list_statistics(
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = ContactListService(db)
    return service.get_contact_list_statistics()

@router.get("/{list_id}", response_model=list_schema.ContactList)
def get_contact_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = ContactListService(db)
    contact_list = service.get_contact_list(list_id)
    if not contact_list:
        raise HTTPException(status_code=404, detail="Contact list not found")
    return contact_list

@router.put("/{list_id}", response_model=list_schema.ContactList)
def update_contact_list(
    list_id: int,
    list_data: list_schema.ContactListUpdate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = ContactListService(db)
    updated_list = service.update_contact_list(list_id, list_data)
    if not updated_list:
        raise HTTPException(status_code=404, detail="Contact list not found")
    return updated_list

@router.delete("/{list_id}")
def delete_contact_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = ContactListService(db)
    deleted_list = service.soft_delete_contact_list(list_id)
    if not deleted_list:
        raise HTTPException(status_code=404, detail="Contact list not found")
    return {"message": "Contact list deleted successfully"}

@router.get("/{list_id}/available-contacts", response_model=List[Contact])
def get_available_contacts_for_list(
    list_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = ContactListService(db)
    contact_list = service.get_contact_list(list_id)
    if not contact_list:
        raise HTTPException(status_code=404, detail="Contact list not found")
    
    return service.get_available_contacts_for_list(
        contact_list.type_client, 
        contact_list.zone_geographique, 
        skip, 
        limit
    )

@router.post("/{list_id}/contacts", response_model=list_schema.ContactList)
def add_contacts_to_list(
    list_id: int,
    contact_ids: List[int],
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = ContactListService(db)
    updated_list = service.add_contacts_to_list(list_id, contact_ids)
    if not updated_list:
        raise HTTPException(status_code=404, detail="Contact list not found")
    return updated_list

@router.delete("/{list_id}/contacts")
def remove_contacts_from_list(
    list_id: int,
    contact_ids: List[int],
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user)
):
    service = ContactListService(db)
    updated_list = service.remove_contacts_from_list(list_id, contact_ids)
    if not updated_list:
        raise HTTPException(status_code=404, detail="Contact list not found")
    return updated_list
