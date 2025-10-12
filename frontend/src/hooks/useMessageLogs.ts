import { useQuery } from 'react-query';
import { api } from '../services/api';
import { MessageLog } from '../types';

export const useMessageLogs = () => {
  return useQuery<MessageLog[], Error>('messageLogs', async () => {
    const response = await api.get('/messages/logs');
    return response.data;
  });
};