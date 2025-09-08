from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.api.v1.schemas import contact as contact_schema
from app.services import contact_service
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=contact_schema.Contact)
def create_contact(
    contact: contact_schema.ContactCreate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Create new contact.
    """
    return contact_service.create_contact(db=db, contact=contact)


from fastapi import Query

@router.get("/", response_model=List[contact_schema.Contact])
def read_contacts(
    skip: int = 0,
    limit: int = 100,
    search: str = Query(None, description="Search by name, email, or phone number"),
    type_client: str = Query(None, description="Filter by contact type"),
    zone_geographique: str = None,
    segments: str = Query(None, description="Comma-separated list of segments to filter by"),
    statut_opt_in: bool = None,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Retrieve contacts with optional filtering and search.
    """
    filters = {
        "search": search,
        "type_client": type_client,
        "segments": segments.split(',') if segments else [],
        "zone_geographique": zone_geographique,
        "statut_opt_in": statut_opt_in,
    }
    # Remove None values so we don't filter by them
    active_filters = {k: v for k, v in filters.items() if v is not None and v != []}

    contacts = contact_service.get_contacts(db, filters=active_filters, skip=skip, limit=limit)
    return contacts


@router.get("/{contact_id}", response_model=contact_schema.Contact)
def read_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get contact by ID.
    """
    db_contact = contact_service.get_contact(db, contact_id=contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact


@router.put("/{contact_id}", response_model=contact_schema.Contact)
def update_contact(
    contact_id: int,
    contact: contact_schema.ContactUpdate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Update a contact.
    """
    db_contact = contact_service.get_contact(db, contact_id=contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact_service.update_contact(db=db, contact_id=contact_id, contact=contact)


@router.delete("/{contact_id}", response_model=contact_schema.Contact)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Delete a contact.
    """
    db_contact = contact_service.get_contact(db, contact_id=contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact_service.delete_contact(db=db, contact_id=contact_id)


@router.post("/bulk-opt-status", response_model=dict)
def bulk_update_contact_opt_status(
    payload: contact_schema.BulkOptInUpdate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Bulk update the opt-in status for a list of contacts.
    """
    result = contact_service.bulk_update_opt_status(
        db=db,
        contact_ids=payload.contact_ids,
        opt_in_status=payload.opt_in_status
    )
    return result


@router.post("/import", response_model=dict)
def import_contacts(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Import contacts from a CSV or Excel file.

    The file should have the following columns:
    - **FirstName**: The first name of the contact.
    - **LastName**: The last name of the contact.
    - **PhoneNumber**: The phone number of the contact (must be unique).
    - **Email**: The email address of the contact (optional).
    - **OptInStatus**: The opt-in status (True/False, optional, defaults to True).
    - **Segment**: A custom segment for the contact (optional).
    - **Zone**: The geographical zone of the contact (optional).
    - **ClientType**: The type of client (optional).

    The endpoint will validate each row. If any row fails validation, the entire
    import will be rolled back and a detailed error report will be returned.
    """
    return contact_service.import_contacts_from_file(db=db, file=file)


@router.get("/segments", response_model=List[str])
def get_segments(
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get all unique contact segments.
    """
    segments = contact_service.get_contact_segments(db)
    return [s[0] for s in segments if s[0]]
