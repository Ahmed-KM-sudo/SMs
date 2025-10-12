from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session
from app.tasks.sms_tasks import process_sms_batch, send_scheduled_campaigns
from app.db.models import Campaign, Contact, MailingList, SMSQueue, Message
from datetime import datetime, timedelta, timezone

@patch("app.tasks.sms_tasks.CampaignExecutionService")
@patch("app.tasks.sms_tasks.SessionLocal")
def test_send_scheduled_campaigns(MockSessionLocal, MockExecutionService, db_session: Session):
    # --- Setup ---
    MockSessionLocal.return_value = db_session
    mock_service_instance = MockExecutionService.return_value

    # Create a campaign that is scheduled and ready to be launched
    scheduled_campaign = Campaign(
        nom_campagne="Scheduled Campaign",
        statut="scheduled",
        date_debut=datetime.now(timezone.utc) - timedelta(hours=1), # Scheduled for 1 hour ago
        date_fin=datetime.now(timezone.utc) + timedelta(days=1),
        type_campagne="promotional", id_agent=1
    )
    db_session.add(scheduled_campaign)
    db_session.commit()

    # --- Execute ---
    send_scheduled_campaigns()

    # --- Assert ---
    # Verify that the launch method was called for the scheduled campaign
    mock_service_instance.launch_campaign.assert_called_once_with(scheduled_campaign.id_campagne)


@patch("app.tasks.sms_tasks.SessionLocal")
@patch("app.tasks.sms_tasks.TwilioProvider")
def test_process_sms_queue_success(MockTwilioProvider, MockSessionLocal, db_session: Session):
    # --- Setup ---
    MockSessionLocal.return_value = db_session
    mock_provider_instance = MockTwilioProvider.return_value
    mock_provider_instance.send_sms.return_value = {"sid": "SM_SUCCESS", "status": "queued"}
    mock_provider_instance.twilio_phone_number = "+15005550006"

    contact = Contact(nom="Queue", prenom="Proc", numero_telephone="+33712345678")
    campaign = Campaign(nom_campagne="Proc Campaign", date_debut=datetime.now(timezone.utc), date_fin=datetime.now(timezone.utc), statut="active", type_campagne="promotional", id_agent=1)
    mailing_list = MailingList(nom_liste="Proc List", campaign=campaign, contacts=[contact])
    db_session.add_all([contact, campaign, mailing_list])
    db_session.commit()
    contact_id = contact.id_contact

    queue_item = SMSQueue(campaign_id=campaign.id_campagne, contact_id=contact_id, message_content="Go", scheduled_at=datetime.now(timezone.utc))
    db_session.add(queue_item)
    db_session.commit()
    queue_item_id = queue_item.id

    # --- Execute ---
    process_sms_batch()

    # --- Assert ---
    processed_item = db_session.get(SMSQueue, queue_item_id)
    assert processed_item.status == 'sent'
    assert processed_item.processed_at is not None

    message = db_session.query(Message).filter_by(id_contact=contact_id).first()
    assert message is not None
    assert message.external_message_id == "SM_SUCCESS"
    assert message.statut_livraison == "sent"


@patch("app.tasks.sms_tasks.SessionLocal")
@patch("app.tasks.sms_tasks.TwilioProvider")
def test_process_sms_queue_failure_and_retry(MockTwilioProvider, MockSessionLocal, db_session: Session):
    # --- Setup ---
    MockSessionLocal.return_value = db_session
    from app.services.sms_providers.twilio_provider import TwilioApiError
    mock_provider_instance = MockTwilioProvider.return_value
    mock_provider_instance.send_sms.side_effect = TwilioApiError("Test API Error")

    contact = Contact(nom="QueueFail", prenom="Proc", numero_telephone="+33787654321")
    campaign = Campaign(nom_campagne="Proc Campaign Fail", date_debut=datetime.now(timezone.utc), date_fin=datetime.now(timezone.utc), statut="active", type_campagne="promotional", id_agent=1)
    mailing_list_fail = MailingList(nom_liste="Proc List Fail", campaign=campaign, contacts=[contact])
    db_session.add_all([contact, campaign, mailing_list_fail])
    db_session.commit()
    contact_id = contact.id_contact

    queue_item = SMSQueue(campaign_id=campaign.id_campagne, contact_id=contact_id, message_content="Fail", scheduled_at=datetime.now(timezone.utc))
    db_session.add(queue_item)
    db_session.commit()
    queue_item_id = queue_item.id

    # --- Execute ---
    process_sms_batch()

    # --- Assert ---
    processed_item = db_session.get(SMSQueue, queue_item_id)
    assert processed_item.status == 'pending'
    assert processed_item.attempts == 1
    assert "Test API Error" in processed_item.error_message


@patch("app.tasks.sms_tasks.settings")
@patch("app.tasks.sms_tasks.SessionLocal")
@patch("app.tasks.sms_tasks.TwilioProvider")
def test_process_sms_queue_respects_rate_limit(MockTwilioProvider, MockSessionLocal, mock_settings, db_session: Session):
    # --- Setup ---
    # Configure the rate limit via the mocked settings
    mock_settings.SMS_RATE_LIMIT = "5"

    MockSessionLocal.return_value = db_session
    mock_provider_instance = MockTwilioProvider.return_value
    mock_provider_instance.send_sms.return_value = {"sid": "SM_SUCCESS", "status": "queued"}
    mock_provider_instance.twilio_phone_number = "+15005550006"

    # Create a campaign and contact to associate with the queue items
    contact = Contact(nom="Rate", prenom="Limit", numero_telephone="+33711111111")
    campaign = Campaign(nom_campagne="Rate Limit Campaign", date_debut=datetime.now(timezone.utc), date_fin=datetime.now(timezone.utc), statut="active", type_campagne="promotional", id_agent=1)
    # This mailing list is required by the task to create the final Message record.
    mailing_list = MailingList(nom_liste="Rate Limit List", campaign=campaign, contacts=[contact])
    db_session.add_all([contact, campaign, mailing_list])
    db_session.commit()

    # Create 10 items in the queue
    for i in range(10):
        queue_item = SMSQueue(campaign_id=campaign.id_campagne, contact_id=contact.id_contact, message_content=f"Msg {i}", scheduled_at=datetime.now(timezone.utc))
        db_session.add(queue_item)
    db_session.commit()

    # --- Execute ---
    process_sms_batch()

    # --- Assert ---
    # Verify that send_sms was called exactly 5 times, respecting the rate limit
    assert mock_provider_instance.send_sms.call_count == 5
