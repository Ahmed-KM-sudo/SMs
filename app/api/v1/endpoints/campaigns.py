from typing import List
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta

from app.api.v1.schemas import campaign as campaign_schema
from app.services import campaign_service, report_service
from app.db.session import get_db
from app.db.models import Agent, Message, SMSQueue
from app.core.security import get_current_user
from app.services.campaign_execution_service import CampaignExecutionService


router = APIRouter()

@router.post("/", response_model=campaign_schema.Campaign)
def create_campaign(
    campaign: campaign_schema.CampaignCreate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Create new campaign.
    """
    return campaign_service.create_campaign(db=db, campaign=campaign, agent_id=current_user.id_agent)




@router.get("/", response_model=List[campaign_schema.Campaign])
def read_campaigns(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Retrieve campaigns.
    """
    campaigns = campaign_service.get_campaigns(db, skip=skip, limit=limit)
    return campaigns


@router.get("/{campaign_id}", response_model=campaign_schema.Campaign)
def read_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get campaign by ID.
    """
    db_campaign = campaign_service.get_campaign(db, campaign_id=campaign_id)
    if db_campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return db_campaign


@router.put("/{campaign_id}", response_model=campaign_schema.Campaign)
def update_campaign(
    campaign_id: int,
    campaign: campaign_schema.CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Update a campaign.
    """
    db_campaign = campaign_service.get_campaign(db, campaign_id=campaign_id)
    if db_campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    # Add authorization logic here if needed, e.g. check if current_user is the owner
    return campaign_service.update_campaign(db=db, campaign_id=campaign_id, campaign=campaign)


@router.delete("/{campaign_id}", response_model=campaign_schema.Campaign)
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Delete a campaign.
    """
    db_campaign = campaign_service.get_campaign(db, campaign_id=campaign_id)
    if db_campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    # Add authorization logic here if needed
    return campaign_service.delete_campaign(db=db, campaign_id=campaign_id)

@router.post("/{campaign_id}/launch", response_model=dict)
def launch_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Launch a campaign.
    """
    execution_service = CampaignExecutionService(db=db)
    result = execution_service.launch_campaign(campaign_id=campaign_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@router.post("/{campaign_id}/pause", response_model=campaign_schema.Campaign)
def pause_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Pause an active campaign.
    """
    result = campaign_service.pause_campaign(db=db, campaign_id=campaign_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result.get("campaign")


@router.get("/{campaign_id}/status", response_model=campaign_schema.CampaignStatus)
def get_campaign_status(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get real-time status and statistics for a campaign.
    """
    # First, check if the campaign exists to return a 404 if not
    campaign = campaign_service.get_campaign(db, campaign_id=campaign_id)
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")

    status_data = report_service.get_campaign_status(db=db, campaign_id=campaign_id)
    return status_data


@router.get("/{campaign_id}/preview", response_model=campaign_schema.CampaignPreview)
def preview_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get a preview of personalized messages for a campaign.
    """
    campaign = campaign_service.get_campaign(db, campaign_id=campaign_id)
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")

    execution_service = CampaignExecutionService(db=db)
    preview_data = execution_service.preview_campaign(campaign_id=campaign_id)
    return preview_data


@router.get("/analytics/performance", response_model=dict)
def get_performance_analytics(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get performance analytics for campaigns and messages over the last N days.
    """
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Get overall delivery statistics
    delivery_stats = (
        db.query(
            func.count(Message.id_message).label("total_messages"),
            func.sum(case((Message.statut_livraison == "delivered", 1), else_=0)).label("delivered_count"),
            func.sum(case((Message.statut_livraison == "failed", 1), else_=0)).label("failed_count"),
        )
        .filter(Message.date_envoi >= start_date)
        .first()
    )
    
    total_messages = delivery_stats.total_messages or 0
    delivered_count = delivery_stats.delivered_count or 0
    failed_count = delivery_stats.failed_count or 0
    delivery_rate = (delivered_count / total_messages * 100) if total_messages > 0 else 0
    
    # Get daily volume data for the last 7 days
    daily_volumes = []
    for i in range(7):
        day = end_date - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        volume = (
            db.query(func.count(Message.id_message))
            .filter(Message.date_envoi >= day_start)
            .filter(Message.date_envoi < day_end)
            .scalar()
        ) or 0
        
        daily_volumes.append({
            "date": day.strftime("%Y-%m-%d"),
            "volume": volume
        })
    
    # Get monthly trend data (last 6 months)
    monthly_trends = []
    for i in range(6):
        month = end_date.replace(day=1) - timedelta(days=30 * i)
        month_start = month.replace(hour=0, minute=0, second=0, microsecond=0)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_stats = (
            db.query(
                func.count(Message.id_message).label("total"),
                func.sum(case((Message.statut_livraison == "delivered", 1), else_=0)).label("delivered"),
                func.sum(case((Message.statut_livraison == "failed", 1), else_=0)).label("failed"),
            )
            .filter(Message.date_envoi >= month_start)
            .filter(Message.date_envoi <= month_end)
            .first()
        )
        
        monthly_trends.append({
            "month": month.strftime("%b"),
            "delivered": month_stats.delivered or 0,
            "failed": month_stats.failed or 0
        })
    
    # Get hourly volume for today
    today = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
    hourly_volumes = []
    
    for hour in range(0, 24, 4):  # Every 4 hours
        hour_start = today + timedelta(hours=hour)
        hour_end = hour_start + timedelta(hours=4)
        
        volume = (
            db.query(func.count(Message.id_message))
            .filter(Message.date_envoi >= hour_start)
            .filter(Message.date_envoi < hour_end)
            .scalar()
        ) or 0
        
        hourly_volumes.append({
            "time": f"{hour:02d}:00",
            "volume": volume
        })
    
    return {
        "delivery_rate": round(delivery_rate, 1),
        "total_delivered": delivered_count,
        "total_failed": failed_count,
        "daily_volumes": list(reversed(daily_volumes)),  # Most recent first
        "monthly_trends": list(reversed(monthly_trends)),  # Most recent first
        "hourly_volumes": hourly_volumes
    }
