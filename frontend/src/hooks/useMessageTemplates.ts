import { useQuery } from 'react-query';
import { api } from '../services/api';
import { MessageTemplate } from '../types';

export const useMessageTemplates = () => {
  return useQuery<MessageTemplate[], Error>('messageTemplates', async () => {
    const response = await api.get('/templates');
    return response.data;
  });
};