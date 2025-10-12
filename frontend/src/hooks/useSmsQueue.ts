import { useQuery } from 'react-query';
import { api } from '../services/api';
import { SmsQueue } from '../types';

export const useSmsQueue = () => {
  return useQuery<SmsQueue[], Error>('smsQueue', async () => {
    const response = await api.get('/sms/queue');
    return response.data;
  });
};