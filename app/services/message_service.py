from sqlalchemy.orm import Session
from app.db.models import Message, MessageLog

def get_message_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(MessageLog).offset(skip).limit(limit).all()

def get_message(db: Session, message_id: int):
    return db.query(Message).filter(Message.id_message == message_id).first()

def get_messages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Message).offset(skip).limit(limit).all()

def get_messages_by_campaign(db: Session, campaign_id: int, skip: int = 0, limit: int = 100):
    return db.query(Message).filter(Message.id_campagne == campaign_id).offset(skip).limit(limit).all()

def resend_message(db: Session, message_id: int):
    # In a real application, this would trigger a call to the SMS provider.
    # For now, we simulate this by resetting the status to 'pending'.
    db_message = get_message(db, message_id)
    if db_message:
        db_message.statut_livraison = "pending"
        db.commit()
        db.refresh(db_message)
        return db_message
    return None