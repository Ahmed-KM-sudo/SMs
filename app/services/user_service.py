from sqlalchemy.orm import Session
from app.db.models import Agent
from app.api.v1.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash
from app.services.audit_service import AuditService

def create_user(db: Session, user: UserCreate, current_admin: Agent):
    user_data = user.model_dump()
    hashed_password = get_password_hash(user_data.pop("password"))
    # Ensure role is lowercase
    if 'role' in user_data:
        user_data['role'] = user_data['role'].lower()
    db_user = Agent(**user_data, mot_de_passe=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    AuditService.log_activity(db, user=current_admin, action="create_user", table_affected="agents", record_id=db_user.id_agent)

    return db_user

def get_user(db: Session, user_id: int):
    return db.query(Agent).filter(Agent.id_agent == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(Agent).filter(Agent.identifiant == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Agent).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, user: UserUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user.model_dump(exclude_unset=True)
        if "password" in update_data:
            update_data["mot_de_passe"] = get_password_hash(update_data.pop("password"))

        for key, value in update_data.items():
            setattr(db_user, key, value)

        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user
