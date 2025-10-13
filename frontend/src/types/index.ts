export interface MessageLog {
  id_log: number;
  id_message: number;
  log_time: string;
  statut_message: string;
  notes: string;
}

export interface MessageTemplate {
  id_modele: number;
  nom_modele: string;
  contenu_modele: string;
  variables: any;
  created_at: string;
  created_by: number;
}

export interface Message {
  id_message: number;
  contenu: string;
  date_envoi: string;
  statut_livraison: string;
  identifiant_expediteur: string;
  external_message_id: string;
  id_contact: number;
  id_campagne: number;
  id_liste_diffusion: number;
}

export interface SmsQueue {
  id_queue: number;
  id_message: number;
  date_ajout: string;
  priorite: number;
  statut: string;
}

export interface Contact {
    id_contact: number;
    nom: string;
    prenom: string;
    numero_telephone: string;
    email?: string;
    statut_opt_in: boolean;
    segment?: string;
    zone_geographique?: string;
    type_client?: string;
    created_at: string;
    updated_at: string;
}