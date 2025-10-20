import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  getQueueStats, 
  getQueueItems, 
  cancelQueueItem, 
  retryQueueItem, 
  getMessageTimeline,
  getCampaignMessageStats,
  getFailedMessages,
  triggerCleanup,
  getQueueHealth,
  QueueStats,
  QueueItem,
  MessageTimeline,
  CampaignStats
} from '../services/queueApi';
import toast from 'react-hot-toast';

// Queue Stats Hook
export const useQueueStats = (options?: { refetchInterval?: number }) => {
  return useQuery<QueueStats>('queue-stats', getQueueStats, {
    refetchInterval: options?.refetchInterval || 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });
};

// Queue Items Hook
export const useQueueItems = (filters: {
  status_filter?: string;
  campaign_id?: number;
  limit?: number;
  offset?: number;
} = {}) => {
  return useQuery<QueueItem[]>(
    ['queue-items', filters], 
    () => getQueueItems(filters),
    {
      refetchInterval: 15000, // Refresh every 15 seconds
      staleTime: 5000,
    }
  );
};

// Cancel Queue Item Mutation
export const useCancelQueueItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation(cancelQueueItem, {
    onSuccess: (data, itemId) => {
      queryClient.invalidateQueries('queue-items');
      queryClient.invalidateQueries('queue-stats');
      toast.success(`Queue item ${itemId} cancelled successfully`);
    },
    onError: (error: any) => {
      toast.error(`Failed to cancel queue item: ${error.response?.data?.detail || error.message}`);
    },
  });
};

// Retry Queue Item Mutation
export const useRetryQueueItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation(retryQueueItem, {
    onSuccess: (data, itemId) => {
      queryClient.invalidateQueries('queue-items');
      queryClient.invalidateQueries('queue-stats');
      toast.success(`Queue item ${itemId} reset for retry`);
    },
    onError: (error: any) => {
      toast.error(`Failed to retry queue item: ${error.response?.data?.detail || error.message}`);
    },
  });
};

// Message Timeline Hook
export const useMessageTimeline = (messageId: number, enabled: boolean = true) => {
  return useQuery<MessageTimeline>(
    ['message-timeline', messageId], 
    () => getMessageTimeline(messageId),
    {
      enabled,
      refetchInterval: 10000, // Refresh every 10 seconds when enabled
    }
  );
};

// Campaign Message Stats Hook
export const useCampaignMessageStats = (campaignId: number, enabled: boolean = true) => {
  return useQuery<CampaignStats>(
    ['campaign-message-stats', campaignId], 
    () => getCampaignMessageStats(campaignId),
    {
      enabled,
      refetchInterval: 30000,
    }
  );
};

// Failed Messages Hook
export const useFailedMessages = (filters: {
  campaign_id?: number;
  limit?: number;
} = {}) => {
  return useQuery(
    ['failed-messages', filters], 
    () => getFailedMessages(filters),
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );
};

// Cleanup Mutation
export const useCleanup = () => {
  const queryClient = useQueryClient();
  
  return useMutation(triggerCleanup, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('queue-stats');
      
      if (data.status === 'preview') {
        toast.success(`Preview: Would delete ${data.would_delete.total_records} records`);
      } else {
        toast.success(`Cleanup completed: ${data.deleted.total_records} records deleted`);
      }
    },
    onError: (error: any) => {
      toast.error(`Cleanup failed: ${error.response?.data?.detail || error.message}`);
    },
  });
};

// Queue Health Hook
export const useQueueHealth = () => {
  return useQuery('queue-health', getQueueHealth, {
    refetchInterval: 60000, // Check health every minute
    retry: false, // Don't retry on health check failures
  });
};
