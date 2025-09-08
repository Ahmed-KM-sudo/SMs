import io
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from pydantic import ValidationError
from fastapi import UploadFile

from app.db.models import Contact
from app.api.v1.schemas.contact import ContactCreate, ContactUpdate


def create_contact(db: Session, contact: ContactCreate):
    db_contact = Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def get_contact(db: Session, contact_id: int):
    return db.query(Contact).filter(Contact.id_contact == contact_id).first()

def get_contacts(db: Session, filters: dict, skip: int = 0, limit: int = 100):
    query = db.query(Contact)

    # Apply search filter
    if "search" in filters and filters["search"]:
        search_term = f"%{filters['search']}%"
        query = query.filter(
            (Contact.prenom.ilike(search_term)) |
            (Contact.nom.ilike(search_term)) |
            (Contact.numero_telephone.ilike(search_term)) |
            (Contact.email.ilike(search_term))
        )
    
    # Apply other filters dynamically
    if "type_client" in filters:
        query = query.filter(Contact.type_client == filters["type_client"])
    if "segments" in filters and filters["segments"]:
        query = query.filter(Contact.segment.in_(filters["segments"]))
    if "zone_geographique" in filters:
        query = query.filter(Contact.zone_geographique == filters["zone_geographique"])
    if "statut_opt_in" in filters:
        query = query.filter(Contact.statut_opt_in == filters["statut_opt_in"])

    return query.offset(skip).limit(limit).all()

def update_contact(db: Session, contact_id: int, contact: ContactUpdate):
    db_contact = get_contact(db, contact_id)
    if db_contact:
        for key, value in contact.model_dump().items():
            setattr(db_contact, key, value)
        db.commit()
        db.refresh(db_contact)
    return db_contact

def delete_contact(db: Session, contact_id: int):
    db_contact = get_contact(db, contact_id)
    if db_contact:
        db.delete(db_contact)
        db.commit()
    return db_contact

def import_contacts_from_file(db: Session, file: UploadFile):
    try:
        content = file.file.read()

        # Check if the file has already been mapped (contains model field names)
        # or if it needs mapping from standard column names
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(io.BytesIO(content))
        else:
            return {"error": "Unsupported file format. Please use CSV or Excel."}

        # Check if the file has already been mapped by the frontend
        model_fields = set(ContactCreate.model_fields.keys())
        file_columns = set(df.columns)
        
        # If the file contains model field names, it's already mapped
        if model_fields.intersection(file_columns):
            # File is already mapped, use as-is
            pass
        else:
            # File needs mapping from standard column names
            column_mapping = {
                'FirstName': 'prenom', 'LastName': 'nom', 'PhoneNumber': 'numero_telephone',
                'Email': 'email', 'OptInStatus': 'statut_opt_in', 'Segment': 'segment',
                'Zone': 'zone_geographique', 'ClientType': 'type_client'
            }
            df.rename(columns=column_mapping, inplace=True)

        contacts_to_create = []
        errors = []
        valid_model_fields = set(ContactCreate.model_fields.keys())

        for index, row in df.iterrows():
            try:
                contact_dict = row.to_dict()
                contact_dict_cleaned = {k: v for k, v in contact_dict.items() if pd.notna(v)}

                # Filter dict to only include keys that are valid for the Pydantic model
                filtered_dict = {k: v for k, v in contact_dict_cleaned.items() if k in valid_model_fields}

                contact_data = ContactCreate(**filtered_dict)
                contacts_to_create.append(contact_data.model_dump())
            except ValidationError as e:
                errors.append({"row": index + 2, "errors": e.errors()})

        if errors:
            db.rollback()
            return {"message": "Import failed due to validation errors.", "errors": errors}

        if contacts_to_create:
            db.bulk_insert_mappings(Contact, contacts_to_create)
            db.commit()

        return {"message": f"{len(contacts_to_create)} contacts imported successfully."}

    except Exception as e:
        db.rollback()
        return {"error": f"An unexpected error occurred: {str(e)}"}

from sqlalchemy import or_
from app.api.v1.schemas.mailing_list import ContactFilter

def search_contacts_by_query(db: Session, query: str, skip: int = 0, limit: int = 100):
    """
    Searches for contacts by a query string across multiple fields.
    """
    search_query = f"%{query}%"
    return db.query(Contact).filter(
        or_(
            Contact.nom.ilike(search_query),
            Contact.prenom.ilike(search_query),
            Contact.email.ilike(search_query),
            Contact.numero_telephone.ilike(search_query)
        )
    ).offset(skip).limit(limit).all()

def filter_contacts_by_criteria(db: Session, filters: ContactFilter, skip: int = 0, limit: int = 100):
    """
    Filters contacts based on a set of criteria.
    """
    query = db.query(Contact)
    if filters.segment:
        query = query.filter(Contact.segment == filters.segment)
    if filters.zone_geographique:
        query = query.filter(Contact.zone_geographique == filters.zone_geographique)
    if filters.type_client:
        query = query.filter(Contact.type_client == filters.type_client)
    if filters.statut_opt_in is not None:
        query = query.filter(Contact.statut_opt_in == filters.statut_opt_in)

    return query.offset(skip).limit(limit).all()

def get_contact_segments(db: Session):
    return db.query(distinct(Contact.segment)).all()


def bulk_update_opt_status(db: Session, contact_ids: list[int], opt_in_status: bool):
    """
    Performs a bulk update of the opt-in status for a list of contacts.
    """
    if not contact_ids:
        return {"updated_count": 0}

    update_stmt = (
        Contact.__table__.update()
        .where(Contact.id_contact.in_(contact_ids))
        .values(statut_opt_in=opt_in_status)
    )
    result = db.execute(update_stmt)
    db.commit()
    return {"updated_count": result.rowcount}
