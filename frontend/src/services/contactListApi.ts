import api from './api';

export interface ContactList {
  id_contact_list: number;
  nom_liste: string;
  type_client: string;
  zone_geographique: string;
  contacts: Contact[];
  created_at: string;
}

export interface ContactListCreate {
  nom_liste: string;
  type_client: string;
  zone_geographique: string;
}

export interface ContactListUpdate {
  nom_liste?: string;
  type_client?: string;
  zone_geographique?: string;
}

export interface ContactListStatistics {
  id_contact_list: number;
  nom_liste: string;
  type_client: string;
  zone_geographique: string;
  total_contacts: number;
  created_at: string;
}

export interface Contact {
  id_contact: number;
  nom: string;
  prenom: string;
  numero_telephone: string;
  email?: string;
  type_client: string;
  zone_geographique: string;
}

// API Functions
export const getContactLists = async (): Promise<ContactList[]> => {
  const response = await api.get<ContactList[]>('/contact-lists/');
  return response.data;
};

export const getContactList = async (listId: number): Promise<ContactList> => {
  const response = await api.get<ContactList>(`/contact-lists/${listId}`);
  return response.data;
};

export const createContactList = async (payload: ContactListCreate): Promise<ContactList> => {
  const response = await api.post<ContactList>('/contact-lists/', payload);
  return response.data;
};

export const updateContactList = async (listId: number, payload: ContactListUpdate): Promise<ContactList> => {
  const response = await api.put<ContactList>(`/contact-lists/${listId}`, payload);
  return response.data;
};

export const deleteContactList = async (listId: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/contact-lists/${listId}`);
  return response.data;
};

export const getContactListStatistics = async (): Promise<ContactListStatistics[]> => {
  const response = await api.get<ContactListStatistics[]>('/contact-lists/statistics');
  return response.data;
};

export const getAvailableContactsForList = async (listId: number): Promise<Contact[]> => {
  const response = await api.get<Contact[]>(`/contact-lists/${listId}/available-contacts`);
  return response.data;
};

export const addContactsToList = async (listId: number, contactIds: number[]): Promise<ContactList> => {
  const response = await api.post<ContactList>(`/contact-lists/${listId}/contacts`, contactIds);
  return response.data;
};

export const removeContactsFromList = async (listId: number, contactIds: number[]): Promise<ContactList> => {
  const response = await api.delete<ContactList>(`/contact-lists/${listId}/contacts`, { data: contactIds });
  return response.data;
};
