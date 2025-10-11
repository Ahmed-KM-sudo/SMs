import { useQuery } from 'react-query';
import { api } from '../services/api';
import { Message } from '../types';

export const useMessages = () => {
  return useQuery<Message[], Error>('messages', async () => {
    const response = await api.get('/messages');
    return response.data;
  });
};