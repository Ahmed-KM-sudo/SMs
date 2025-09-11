import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.db.models import Campaign, Contact, SMSQueue
from app.utils.phone_validator import validate_and_format_phone_number, InvalidPhoneNumberError
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CampaignExecutionService:
    def __init__(self, db: Session):
        self.db = db

    def _personalize_message(self, template_content: str, contact: Contact) -> str:
        """Replaces placeholders in a message template with contact data."""
        return template_content.format(
            prenom=contact.prenom,
            nom=contact.nom,
            email=contact.email or ''
        )

    def launch_campaign(self, campaign_id: int) -> dict:
        """
        Validates, launches, and queues messages for a campaign.
        """
        campaign = self.db.query(Campaign).filter(Campaign.id_campagne == campaign_id).first()

        if not campaign:
            logger.error(f"Launch failed: Campaign with ID {campaign_id} not found.")
            return {"success": False, "message": "Campaign not found."}

        if campaign.statut != 'draft':
            logger.warning(f"Launch failed: Campaign {campaign_id} is not in 'draft' status (current: {campaign.statut}).")
            return {"success": False, "message": f"Campaign is not in 'draft' status."}

        if not campaign.can_be_launched():
            logger.warning(f"Launch failed: Campaign {campaign_id} does not meet launch requirements (missing template or lists).")
            return {"success": False, "message": "Campaign must have a template and at least one mailing list."}

        # All checks passed, proceed with launch
        logger.info(f"Launching campaign {campaign_id}...")
        campaign.statut = 'active'

        message_template = campaign.template.contenu_modele
        queued_count = 0

        for mailing_list in campaign.mailing_lists:
            for contact in mailing_list.contacts:
                if not contact.statut_opt_in:
                    logger.info(f"Skipping contact {contact.id_contact} (opted out).")
                    continue

                try:
                    # Get country code with fallback to ensure we always have a valid value
                    country_code = getattr(settings, 'DEFAULT_COUNTRY_CODE', 'FR')
                    if not country_code:
                        country_code = 'FR'  # Fallback to France if setting is empty
                    
                    logger.debug(f"Validating phone number {contact.numero_telephone} with country code: {country_code}")
                    
                    validated_phone = validate_and_format_phone_number(contact.numero_telephone, country_code)
                    logger.debug(f"Phone validation successful: {contact.numero_telephone} -> {validated_phone}")
                    
                    personalized_content = self._personalize_message(message_template, contact)
                    new_queue_item = SMSQueue(
                        campaign_id=campaign.id_campagne,
                        contact_id=contact.id_contact,
                        message_content=personalized_content,
                        scheduled_at=datetime.now(timezone.utc),
                        status='pending'
                    )
                    self.db.add(new_queue_item)
                    queued_count += 1
                except InvalidPhoneNumberError as e:
                    logger.warning(f"Skipping contact {contact.id_contact} for campaign {campaign.id_campagne}: {e}")

        if queued_count > 0:
            self.db.commit()
            logger.info(f"Successfully launched campaign {campaign.id_campagne} and queued {queued_count} messages.")
            return {"success": True, "message": "Campaign launched successfully.", "queued_count": queued_count}
        else:
            # If no contacts were valid, rollback the status change
            campaign.statut = 'draft'
            self.db.commit()
            logger.warning(f"Campaign {campaign.id_campagne} launched, but no valid contacts found to queue.")
            return {"success": False, "message": "No valid contacts found in campaign mailing lists."}

    def preview_campaign(self, campaign_id: int, limit: int = 5) -> dict:
        """
        Generates a preview of personalized messages for a campaign.
        """
        campaign = self.db.query(Campaign).filter(Campaign.id_campagne == campaign_id).first()
        if not campaign or not campaign.template:
            return {"preview_count": 0, "items": []}

        message_template = campaign.template.contenu_modele
        preview_items = []

        # Collect contacts from all mailing lists associated with the campaign
        all_contacts = []
        for mailing_list in campaign.mailing_lists:
            all_contacts.extend(mailing_list.contacts)

        # Get a limited number of unique contacts for the preview
        unique_contacts = list({contact.id_contact: contact for contact in all_contacts}.values())

        for contact in unique_contacts[:limit]:
            personalized_content = self._personalize_message(message_template, contact)
            preview_items.append({
                "contact_name": f"{contact.prenom} {contact.nom}",
                "phone_number": contact.numero_telephone,
                "personalized_message": personalized_content
            })

        return {"preview_count": len(preview_items), "items": preview_items}
