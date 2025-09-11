import warnings
import os

# Suppress bcrypt version warning - this is a known harmless issue
warnings.filterwarnings("ignore", message=".*error reading bcrypt version.*")
# Also suppress stderr output for bcrypt warnings
os.environ['PYTHONWARNINGS'] = 'ignore::UserWarning:passlib'

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, campaigns, contacts, templates, messages, reports, users, webhooks, mailing_lists, contact_lists, tasks, analytics, admin, health, queue
from app.core.logging import setup_logging
from app.core.monitoring import get_application_health
from app.core.config import settings

setup_logging()

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(campaigns.router, prefix="/api/v1/campaigns", tags=["campaigns"])
app.include_router(contacts.router, prefix="/api/v1/contacts", tags=["contacts"])
app.include_router(templates.router, prefix="/api/v1/templates", tags=["templates"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["messages"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["webhooks"])
app.include_router(mailing_lists.router, prefix="/api/v1/mailing-lists", tags=["mailing-lists"])
app.include_router(contact_lists.router, prefix="/api/v1/contact-lists", tags=["contact-lists"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(queue.router, prefix="/api/v1/queue", tags=["queue"])
app.include_router(health.router, prefix="/health", tags=["health"])

@app.get("/health", tags=["monitoring"])
def health_check():
    """
    Provides a health check endpoint for monitoring systems.
    """
    return get_application_health()

@app.get("/")
def read_root():
    return {
        "message": "SMS Campaign Platform API",
        "status": "running",
        "version": "1.0.0",
        "features": [
            "Advanced Contact Management",
            "Excel/CSV Import",
            "Contact Segmentation",
            "Personalized SMS Campaigns",
            "Campaign Analytics"
        ]
    }
