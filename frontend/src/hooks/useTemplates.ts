import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../services/api';
import { MessageTemplate } from '../types';

export const useTemplates = () => {
  return useQuery<MessageTemplate[], Error>('templates', async () => {
    const response = await api.get('/templates');
    return response.data;
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation((newTemplate: Omit<MessageTemplate, 'id_template'>) => api.post('/templates', newTemplate), {
    onSuccess: () => {
      queryClient.invalidateQueries('templates');
    },
  });
};