from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from app.db.session import engine
import redis
import os
from urllib.parse import urlparse
from twilio.rest import Client
from datetime import datetime

router = APIRouter()

@router.get("/health", tags=["health"])
async def health_check():
    """
    Comprehensive health check for all backend services
    """
    health_status = {
        "timestamp": datetime.now().isoformat(),
        "status": "healthy",
        "services": {}
    }
    
    # Check PostgreSQL
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            health_status["services"]["postgresql"] = {
                "status": "healthy",
                "version": version.split(' ')[1],
                "database": os.getenv('DATABASE_URL', '').split('/')[-1] if '/' in os.getenv('DATABASE_URL', '') else 'unknown'
            }
    except Exception as e:
        health_status["services"]["postgresql"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # Check Redis
    try:
        redis_url = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
        parsed = urlparse(redis_url)
        
        r = redis.Redis(
            host=parsed.hostname or 'localhost',
            port=parsed.port or 6379,
            db=int(parsed.path[1:] if parsed.path else 0)
        )
        
        r.ping()
        info = r.info()
        
        health_status["services"]["redis"] = {
            "status": "healthy",
            "version": info.get('redis_version'),
            "host": f"{parsed.hostname or 'localhost'}:{parsed.port or 6379}",
            "database": parsed.path[1:] if parsed.path else '0'
        }
    except Exception as e:
        health_status["services"]["redis"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # Check Twilio
    try:
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        phone_number = os.getenv('TWILIO_PHONE_NUMBER')
        
        if not all([account_sid, auth_token, phone_number]):
            health_status["services"]["twilio"] = {
                "status": "misconfigured",
                "error": "Missing configuration"
            }
            health_status["status"] = "degraded"
        else:
            client = Client(account_sid, auth_token)
            account = client.api.accounts(account_sid).fetch()
            
            health_status["services"]["twilio"] = {
                "status": "healthy",
                "account_sid": account_sid[:8] + "...",
                "phone_number": phone_number,
                "account_status": account.status
            }
    except Exception as e:
        health_status["services"]["twilio"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # Overall status
    unhealthy_services = [
        service for service, info in health_status["services"].items() 
        if info["status"] not in ["healthy"]
    ]
    
    if unhealthy_services:
        health_status["status"] = "degraded"
        health_status["unhealthy_services"] = unhealthy_services
    
    return health_status

@router.get("/health/simple", tags=["health"])
async def simple_health_check():
    """Simple health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
