from datetime import datetime, timezone
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models import Message, Contact, Campaign, MailingList

def test_twilio_webhook_updates_status_delivered(client: TestClient, db_session: Session):
    # --- Setup ---
    contact = Contact(nom="Webhook", prenom="Test", numero_telephone="+15551234567", email="hook@example.com")
    campaign = Campaign(nom_campagne="Hook Campaign", date_debut=datetime.now(timezone.utc), date_fin=datetime.now(timezone.utc), statut="active", type_campagne="promotional", id_agent=1)
    mailing_list = MailingList(nom_liste="Hook List", campaign=campaign, contacts=[contact])
    message = Message(
        contenu="Test message",
        date_envoi=datetime.now(timezone.utc),
        statut_livraison="sent",
        identifiant_expediteur="test",
        external_message_id="SMwebhookdelivered",
        contact=contact,
        campaign=campaign,
        mailing_list=mailing_list
    )
    db_session.add_all([contact, campaign, mailing_list, message])
    db_session.commit()

    # --- Execute ---
    response = client.post(
            "/webhooks/twilio-status",
        data={"MessageSid": "SMwebhookdelivered", "MessageStatus": "delivered", "Price": "-0.0075"},
    )

    # --- Assert ---
    assert response.status_code == 204
    updated_message = db_session.get(Message, message.id_message)
    assert updated_message.statut_livraison == "delivered"
    assert updated_message.cost == Decimal("0.0075")


def test_twilio_webhook_updates_status_failed(client: TestClient, db_session: Session):
    # --- Setup ---
    contact = Contact(nom="HookFail", prenom="Test", numero_telephone="+15551234568", email="hookfail@example.com")
    campaign = Campaign(nom_campagne="Hook Campaign Fail", date_debut=datetime.now(timezone.utc), date_fin=datetime.now(timezone.utc), statut="active", type_campagne="promotional", id_agent=1)
    mailing_list = MailingList(nom_liste="Hook List Fail", campaign=campaign, contacts=[contact])
    message = Message(
        contenu="Test message",
        date_envoi=datetime.now(timezone.utc),
        statut_livraison="sent",
        identifiant_expediteur="test",
        external_message_id="SMwebhookfailed",
        contact=contact,
        campaign=campaign,
        mailing_list=mailing_list
    )
    db_session.add_all([contact, campaign, mailing_list, message])
    db_session.commit()

    # --- Execute ---
    response = client.post(
            "/webhooks/twilio-status",
        data={"MessageSid": "SMwebhookfailed", "MessageStatus": "failed", "ErrorMessage": "30005-Message-Delivery-Unknown-error"},
    )

    # --- Assert ---
    assert response.status_code == 204
    updated_message = db_session.get(Message, message.id_message)
    assert updated_message.statut_livraison == "failed"
    assert updated_message.error_message == "30005-Message-Delivery-Unknown-error"
