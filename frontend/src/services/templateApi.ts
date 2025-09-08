import api from './api';

export interface Template {
  id_modele: number;
  nom_modele: string;
  contenu_modele: string;
  variables: Record<string, string> | null;
  created_by: number;
}

export const getTemplates = async (): Promise<Template[]> => {
  const response = await api.get<Template[]>('/templates/');
  return response.data;
};

export interface TemplatePayload {
  nom_modele: string;
  contenu_modele: string;
}

export const createTemplate = async (payload: TemplatePayload): Promise<Template> => {
  const response = await api.post<Template>('/templates/', payload);
  return response.data;
};

export const updateTemplate = async ({ id, payload }: { id: number, payload: TemplatePayload }): Promise<Template> => {
  const response = await api.put<Template>(`/templates/${id}`, payload);
  return response.data;
};

export const deleteTemplate = async (id: number): Promise<void> => {
  await api.delete(`/templates/${id}`);
};
