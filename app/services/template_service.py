from sqlalchemy.orm import Session
from app.db.models import MessageTemplate
from app.api.v1.schemas import template as template_schema

def get_templates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(MessageTemplate).offset(skip).limit(limit).all()

def get_template(db: Session, template_id: int):
    return db.query(MessageTemplate).filter(MessageTemplate.id_modele == template_id).first()

def create_template(db: Session, template: template_schema.TemplateCreate, agent_id: int):
    db_template = MessageTemplate(**template.model_dump(), created_by=agent_id)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def update_template(db: Session, template_id: int, template: template_schema.TemplateUpdate):
    db_template = get_template(db, template_id)
    if db_template:
        update_data = template.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_template, key, value)
        db.commit()
        db.refresh(db_template)
    return db_template

def delete_template(db: Session, template_id: int):
    db_template = get_template(db, template_id)
    if db_template:
        db.delete(db_template)
        db.commit()
    return db_template