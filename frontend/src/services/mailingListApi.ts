import api from './api';

// Contact interface
export interface Contact {
  id_contact: number;
  nom: string;
  prenom: string;
  numero_telephone: string;
  segment?: string;
  zone_geographique?: string;
  type_client?: string;
  statut_opt_in: boolean;
}

// Mailing List interfaces
export interface MailingList {
  id_liste: number;
  id_campagne?: number;
  nom_liste: string;
  description: string | null;
  contacts: Contact[];
  created_at: string; // ISO 8601 date string
}

export interface MailingListCreationPayload {
  nom_liste: string;
  description?: string;
  id_campagne?: number;
}

export interface MailingListUpdatePayload {
  nom_liste?: string;
  description?: string;
  id_campagne?: number;
}

// Statistics interface
export interface ListStatistics {
  total_contacts: number;
  opt_in_contacts: number;
  opt_out_contacts: number;
  segments: Record<string, number>;
  zones: Record<string, number>;
  contact_types: Record<string, number>;
}

// Bulk operations interfaces
export interface BulkContactOperation {
  contact_ids: number[];
}

export interface BulkFilter {
  segment?: string;
  zone_geographique?: string;
  statut_opt_in?: boolean;
}

export interface BulkOperationRequest {
  filters: BulkFilter;
}

// Preview interfaces
export interface PreviewRequest {
  message_template: string;
  sample_size?: number;
}

export interface PreviewContact {
  contact_name: string;
  phone_number: string;
  personalized_message: string;
}

export interface PreviewResponse {
  previews: PreviewContact[];
  total_contacts: number;
  estimated_cost: number;
}

// API Functions
export const getMailingLists = async (): Promise<MailingList[]> => {
  const response = await api.get<MailingList[]>('/mailing-lists/');
  return response.data;
};

export const getMailingList = async (listId: number): Promise<MailingList> => {
  const response = await api.get<MailingList>(`/mailing-lists/${listId}`);
  return response.data;
};

export const createMailingList = async (payload: MailingListCreationPayload): Promise<MailingList> => {
  const response = await api.post<MailingList>('/mailing-lists/', payload);
  return response.data;
};

export const updateMailingList = async (listId: number, payload: MailingListUpdatePayload): Promise<MailingList> => {
  const response = await api.put<MailingList>(`/mailing-lists/${listId}`, payload);
  return response.data;
};

export const deleteMailingList = async (listId: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/mailing-lists/${listId}`);
  return response.data;
};

export const duplicateMailingList = async (listId: number): Promise<MailingList> => {
  const response = await api.post<MailingList>(`/mailing-lists/${listId}/duplicate`);
  return response.data;
};

// Contact management
export const getListContacts = async (listId: number): Promise<Contact[]> => {
  const response = await api.get<Contact[]>(`/mailing-lists/${listId}/contacts`);
  return response.data;
};

export const addContactsToList = async (listId: number, contactIds: number[]): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>(
    `/mailing-lists/${listId}/contacts`,
    { contact_ids: contactIds }
  );
  return response.data;
};

export const removeContactsFromList = async (listId: number, contactIds: number[]): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/mailing-lists/${listId}/contacts`,
    { data: { contact_ids: contactIds } }
  );
  return response.data;
};

export const bulkAddContactsByFilter = async (listId: number, filters: BulkFilter): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>(
    `/mailing-lists/${listId}/contacts/bulk-add`,
    { filters }
  );
  return response.data;
};

export const bulkRemoveContactsByFilter = async (listId: number, filters: BulkFilter): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/mailing-lists/${listId}/contacts/bulk-remove`,
    { data: { filters } }
  );
  return response.data;
};

// Statistics
export const getListStatistics = async (listId: number): Promise<ListStatistics> => {
  const response = await api.get<ListStatistics>(`/mailing-lists/${listId}/statistics`);
  return response.data;
};

// Preview
export const previewListCampaign = async (listId: number, request: PreviewRequest): Promise<PreviewResponse> => {
  const response = await api.post<PreviewResponse>(`/mailing-lists/${listId}/preview`, request);
  return response.data;
};
