export interface MessageLog {
  id_log: number;
  id_message: number;
  log_time: string;
  statut_message: string;
  notes: string;
}

export interface MessageTemplate {
  id_template: number;
  nom_template: string;
  contenu: string;
  type_template: string;
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