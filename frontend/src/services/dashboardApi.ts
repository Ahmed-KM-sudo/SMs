import api from './api';

export interface DashboardStats {
  total_campaigns: number;
  total_contacts: number;
  total_sms_sent: number;
  total_cost: number;
  overall_delivery_rate: number;
  total_messages_delivered: number;
  total_messages_failed: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/reports/dashboard');
  return response.data;
};
