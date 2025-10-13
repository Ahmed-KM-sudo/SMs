from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, campaigns, contacts, templates, messages, reports, users, webhooks, sms_webhooks, mailing_lists, tasks, analytics, admin, sms
from app.core.logging import setup_logging
from app.core.monitoring import get_application_health

setup_logging()

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
app.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
app.include_router(templates.router, prefix="/templates", tags=["templates"])
app.include_router(messages.router, prefix="/messages", tags=["messages"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
app.include_router(sms_webhooks.router, prefix="/webhooks", tags=["sms_webhooks"])
app.include_router(mailing_lists.router, prefix="/mailing-lists", tags=["mailing-lists"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(sms.router, prefix="/sms", tags=["sms"])


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