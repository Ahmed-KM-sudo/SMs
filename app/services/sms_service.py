from sqlalchemy.orm import Session
from app.db.models import SMSQueue

def get_sms_queue(db: Session, skip: int = 0, limit: int = 100):
    return db.query(SMSQueue).offset(skip).limit(limit).all()