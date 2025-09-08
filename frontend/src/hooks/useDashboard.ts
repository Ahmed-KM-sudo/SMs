import { useQuery } from 'react-query';
import { getDashboardStats } from '../services/dashboardApi';

export const useDashboardStats = () => {
  return useQuery('dashboard-stats', getDashboardStats, {
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

// Hook for manual refresh
export const useRefreshDashboard = () => {
  return useQuery('dashboard-stats', getDashboardStats, {
    enabled: false, // Only run when manually triggered
  });
};
