from sqlalchemy import (
    Column,
    Integer,
    String,
    TIMESTAMP,
    Boolean,
    TEXT,
    JSON,
    ForeignKey,
    DECIMAL,
    FLOAT,
    CheckConstraint,
    Table
)
from sqlalchemy.orm import relationship
from .base import Base
from sqlalchemy.sql import func

liste_contacts = Table('liste_contacts', Base.metadata,
    Column('id_liste', Integer, ForeignKey('mailing_lists.id_liste'), primary_key=True),
    Column('id_contact', Integer, ForeignKey('contacts.id_contact'), primary_key=True),
    Column('added_at', TIMESTAMP, default=func.now())
)

contact_list_contacts = Table('contact_list_contacts', Base.metadata,
    Column('id_contact_list', Integer, ForeignKey('contact_lists.id_contact_list'), primary_key=True),
    Column('id_contact', Integer, ForeignKey('contacts.id_contact'), primary_key=True),
    Column('added_at', TIMESTAMP, default=func.now())
)

class Agent(Base):
    __tablename__ = 'agents'
    id_agent = Column(Integer, primary_key=True)
    nom_agent = Column(String(100), nullable=False)
    identifiant = Column(String(100), unique=True, nullable=False)
    mot_de_passe = Column(String(255), nullable=False)
    role = Column(String(20), CheckConstraint("role IN ('admin', 'supervisor', 'agent')"), nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)

    templates = relationship("MessageTemplate", back_populates="creator")
    campaigns = relationship("Campaign", back_populates="agent")
    activity_logs = relationship("ActivityLog", back_populates="user")

class MessageTemplate(Base):
    __tablename__ = 'message_templates'
    id_modele = Column(Integer, primary_key=True)
    nom_modele = Column(String(100), nullable=False)
    contenu_modele = Column(TEXT, nullable=False)
    variables = Column(JSON)
    created_at = Column(TIMESTAMP, default=func.now())
    created_by = Column(Integer, ForeignKey('agents.id_agent'))

    creator = relationship("Agent", back_populates="templates")
    campaigns = relationship("Campaign", back_populates="template")

class Campaign(Base):
    __tablename__ = 'campagnes'
    id_campagne = Column(Integer, primary_key=True)
    nom_campagne = Column(String(100), nullable=False)
    date_debut = Column(TIMESTAMP, nullable=False)
    date_fin = Column(TIMESTAMP, nullable=False)
    statut = Column(String(50), CheckConstraint("statut IN ('draft', 'scheduled', 'active', 'completed', 'paused')"), nullable=False)
    type_campagne = Column(String(50), CheckConstraint("type_campagne IN ('promotional', 'informational', 'follow_up')"), nullable=False)
    id_agent = Column(Integer, ForeignKey('agents.id_agent'), nullable=False)
    id_modele = Column(Integer, ForeignKey('message_templates.id_modele'), nullable=True)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    agent = relationship("Agent", back_populates="campaigns")
    template = relationship("MessageTemplate", back_populates="campaigns")
    mailing_lists = relationship("MailingList", back_populates="campaign")
    messages = relationship("Message", back_populates="campaign")
    report = relationship("CampaignReport", back_populates="campaign", uselist=False)

    def can_be_launched(self) -> bool:
        """Checks if the campaign has the minimum requirements to be launched."""
        if not self.mailing_lists:
            return False
        if not self.template:
            return False
        return True

    def can_be_modified(self) -> bool:
        """Checks if the campaign can be modified (i.e., it has not been launched)."""
        return self.statut == 'draft'

class Contact(Base):
    __tablename__ = 'contacts'
    id_contact = Column(Integer, primary_key=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    numero_telephone = Column(String(20), unique=True, nullable=False)
    email = Column(String(255))
    statut_opt_in = Column(Boolean, default=True, nullable=False)
    segment = Column(String(100))
    zone_geographique = Column(String(100))
    type_client = Column(String(50))
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    mailing_lists = relationship("MailingList", secondary=liste_contacts, back_populates="contacts")
    contact_lists = relationship("ContactList", secondary=contact_list_contacts, back_populates="contacts")
    messages = relationship("Message", back_populates="contact")

class MailingList(Base):
    __tablename__ = 'mailing_lists'
    id_liste = Column(Integer, primary_key=True)
    nom_liste = Column(String(100), nullable=False)
    description = Column(TEXT)
    id_campagne = Column(Integer, ForeignKey('campagnes.id_campagne'), nullable=True)
    created_at = Column(TIMESTAMP, default=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

    campaign = relationship("Campaign", back_populates="mailing_lists")
    contacts = relationship("Contact", secondary=liste_contacts, back_populates="mailing_lists")
    messages = relationship("Message", back_populates="mailing_list")

class Message(Base):
    __tablename__ = 'messages'
    id_message = Column(Integer, primary_key=True)
    contenu = Column(TEXT, nullable=False)
    date_envoi = Column(TIMESTAMP, nullable=False)
    statut_livraison = Column(String(50), CheckConstraint("statut_livraison IN ('pending', 'sent', 'delivered', 'failed', 'bounced')"), nullable=False)
    identifiant_expediteur = Column(String(100), nullable=False)
    external_message_id = Column(String(255))
    error_message = Column(TEXT)
    cost = Column(DECIMAL(10, 4))
    id_liste = Column(Integer, ForeignKey('mailing_lists.id_liste'), nullable=False)
    id_contact = Column(Integer, ForeignKey('contacts.id_contact'), nullable=False)
    id_campagne = Column(Integer, ForeignKey('campagnes.id_campagne'), nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())

    mailing_list = relationship("MailingList", back_populates="messages")
    contact = relationship("Contact", back_populates="messages")
    campaign = relationship("Campaign", back_populates="messages")

class CampaignReport(Base):
    __tablename__ = 'campaign_reports'
    id_rapport = Column(Integer, primary_key=True)
    total_sent = Column(Integer, default=0)
    total_delivered = Column(Integer, default=0)
    total_failed = Column(Integer, default=0)
    taux_ouverture = Column(FLOAT, default=0)
    taux_clics = Column(FLOAT, default=0)
    taux_conversion = Column(FLOAT, default=0)
    nombre_desabonnements = Column(Integer, default=0)
    total_cost = Column(DECIMAL(10, 2), default=0)
    id_campagne = Column(Integer, ForeignKey('campagnes.id_campagne'), unique=True, nullable=False)
    last_updated = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    campaign = relationship("Campaign", back_populates="report")


class SMSQueue(Base):
    __tablename__ = 'sms_queue'

    id = Column(Integer, primary_key=True)
    campaign_id = Column(Integer, ForeignKey('campagnes.id_campagne'), nullable=False)
    contact_id = Column(Integer, ForeignKey('contacts.id_contact'), nullable=False)
    message_content = Column(TEXT, nullable=False)
    scheduled_at = Column(TIMESTAMP, nullable=False)
    status = Column(String(20), CheckConstraint("status IN ('pending', 'processing', 'sent', 'failed')"), default='pending')
    attempts = Column(Integer, default=0)
    error_message = Column(TEXT)
    created_at = Column(TIMESTAMP, default=func.now())
    processed_at = Column(TIMESTAMP)

    campaign = relationship("Campaign")
    contact = relationship("Contact")


class ActivityLog(Base):
    __tablename__ = 'activity_logs'
    id_log = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('agents.id_agent'))
    action = Column(String(100), nullable=False)
    table_affected = Column(String(50))
    record_id = Column(Integer)
    old_values = Column(JSON)
    new_values = Column(JSON)
    ip_address = Column(String(45))
    timestamp = Column(TIMESTAMP, default=func.now())

    user = relationship("Agent", back_populates="activity_logs")

class ContactList(Base):
    __tablename__ = 'contact_lists'
    id_contact_list = Column(Integer, primary_key=True)
    nom_liste = Column(String(100), nullable=False)
    type_client = Column(String(50), nullable=False)
    zone_geographique = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

    contacts = relationship("Contact", secondary=contact_list_contacts, back_populates="contact_lists")
