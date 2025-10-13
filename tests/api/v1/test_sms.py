from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.models import SmsQueue, Message, Campaign, Contact
from datetime import datetime, timezone

def test_read_sms_queue(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # Create a contact
    contact = Contact(nom="Test", prenom="Contact", numero_telephone="+1234567890")
    db_session.add(contact)
    db_session.commit()

    # Create a campaign
    campaign = Campaign(nom_campagne="Test Campaign", date_debut=datetime.now(timezone.utc), date_fin=datetime.now(timezone.utc), statut="active", type_campagne="promotional", id_agent=1000)
    db_session.add(campaign)
    db_session.commit()

    # Create a message
    message = Message(contenu="Test message", date_envoi=datetime.now(timezone.utc), statut_livraison="pending", identifiant_expediteur="test", id_contact=contact.id_contact, id_campagne=campaign.id_campagne, id_liste=1)
    db_session.add(message)
    db_session.commit()

    # Create an SMS queue item
    sms_queue_item = SMSQueue(id_message=message.id_message, date_ajout=datetime.now(timezone.utc), priorite=1, statut="pending")
    db_session.add(sms_queue_item)
    db_session.commit()

    response = client.get("/sms/queue", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0