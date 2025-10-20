from sqlalchemy.orm import Session
from app.db.models import Campaign, SMSQueue, Message, MailingList, CampaignReport, MessageLog
from app.api.v1.schemas.campaign import CampaignCreate, CampaignUpdate

def create_campaign(db: Session, campaign: CampaignCreate, agent_id: int):
    db_campaign = Campaign(**campaign.model_dump(), id_agent=agent_id)
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

def get_campaign(db: Session, campaign_id: int):
    return db.query(Campaign).filter(Campaign.id_campagne == campaign_id).first()

def get_campaigns(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Campaign).offset(skip).limit(limit).all()

def update_campaign(db: Session, campaign_id: int, campaign: CampaignUpdate):
    db_campaign = get_campaign(db, campaign_id)
    if db_campaign:
        # Only update fields that are provided (not None)
        update_data = campaign.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                setattr(db_campaign, key, value)
        db.commit()
        db.refresh(db_campaign)
    return db_campaign

def delete_campaign(db: Session, campaign_id: int):
    db_campaign = get_campaign(db, campaign_id)
    if db_campaign:
        try:
            # Delete all related records in the correct order to avoid foreign key constraint violations
            
            # 1. Delete message logs (references messages and sms_queue)
            message_ids = db.query(Message.id_message).filter(Message.id_campagne == campaign_id).subquery()
            db.query(MessageLog).filter(MessageLog.message_id.in_(message_ids)).delete(synchronize_session=False)
            
            # 2. Delete SMS queue items
            db.query(SMSQueue).filter(SMSQueue.campaign_id == campaign_id).delete()
            
            # 3. Delete messages
            db.query(Message).filter(Message.id_campagne == campaign_id).delete()
            
            # 4. Delete campaign report
            db.query(CampaignReport).filter(CampaignReport.id_campagne == campaign_id).delete()
            
            # 5. Update mailing lists to remove campaign reference (set to NULL since it's nullable)
            db.query(MailingList).filter(MailingList.id_campagne == campaign_id).update({"id_campagne": None})
            
            # 6. Finally delete the campaign
            db.delete(db_campaign)
            db.commit()
        except Exception as e:
            db.rollback()
            raise e
    return db_campaign


def pause_campaign(db: Session, campaign_id: int):
    """
    Pauses an active campaign.
    """
    db_campaign = get_campaign(db, campaign_id=campaign_id)
    if not db_campaign:
        return {"success": False, "message": "Campaign not found."}

    if db_campaign.statut != 'active':
        return {"success": False, "message": f"Only active campaigns can be paused. Current status: {db_campaign.statut}."}

    db_campaign.statut = 'paused'
    db.commit()
    db.refresh(db_campaign)
    return {"success": True, "campaign": db_campaign}
