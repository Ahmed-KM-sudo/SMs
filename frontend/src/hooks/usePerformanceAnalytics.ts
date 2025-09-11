import { useQuery } from 'react-query';
import api from '../services/api';

interface PerformanceAnalytics {
  delivery_rate: number;
  total_delivered: number;
  total_failed: number;
  daily_volumes: Array<{
    date: string;
    volume: number;
  }>;
  monthly_trends: Array<{
    month: string;
    delivered: number;
    failed: number;
  }>;
  hourly_volumes: Array<{
    time: string;
    volume: number;
  }>;
}

export const usePerformanceAnalytics = (days: number = 30) => {
  return useQuery<PerformanceAnalytics>(
    ['performance-analytics', days],
    async () => {
      const response = await api.get(`/campaigns/analytics/performance?days=${days}`);
      return response.data;
    },
    {
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
      staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    }
  );
};
