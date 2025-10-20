import api from './api';

// Types for Queue Management
export interface QueueStats {
  total_pending: number;
  total_processing: number;
  total_sent: number;
  total_failed: number;
  total_cancelled: number;
  average_processing_time: number;
  success_rate: number;
  retry_rate: number;
}

export interface QueueItem {
  id: number;
  campaign_id?: number;
  contact_id: number;
  contact_phone: string;
  message_content: string;
  status: string;
  priority: number;
  attempts: number;
  max_attempts: number;
  created_at: string;
  scheduled_at?: string;
  processed_at?: string;
  next_retry_at?: string;
  error_message?: string;
  external_message_id?: string;
}

export interface MessageTimeline {
  message_id: number;
  events: Array<{
    id: number;
    timestamp: string;
    status: string;
    provider_status?: string;
    attempt_number: number;
    error_code?: string;
    error_message?: string;
    external_message_id?: string;
    cost?: number;
    processing_duration?: number;
    provider_response?: any;
  }>;
}

export interface CampaignStats {
  campaign_id: number;
  total_messages: number;
  status_breakdown: Record<string, number>;
  delivery_rate: number;
  average_delivery_time: number;
  total_cost: number;
  retry_rate: number;
  error_summary: Record<string, number>;
}

// API Functions
export const getQueueStats = async (): Promise<QueueStats> => {
  const response = await api.get('/queue/stats');
  return response.data;
};

export const getQueueItems = async (params: {
  status_filter?: string;
  campaign_id?: number;
  limit?: number;
  offset?: number;
} = {}): Promise<QueueItem[]> => {
  const response = await api.get('/queue/items', { params });
  return response.data;
};

export const cancelQueueItem = async (itemId: number): Promise<{ status: string; message: string }> => {
  const response = await api.post(`/queue/items/${itemId}/cancel`);
  return response.data;
};

export const retryQueueItem = async (itemId: number): Promise<{ status: string; message: string }> => {
  const response = await api.post(`/queue/items/${itemId}/retry`);
  return response.data;
};

export const getMessageTimeline = async (messageId: number): Promise<MessageTimeline> => {
  const response = await api.get(`/queue/messages/${messageId}/timeline`);
  return response.data;
};

export const getCampaignMessageStats = async (campaignId: number): Promise<CampaignStats> => {
  const response = await api.get(`/queue/campaigns/${campaignId}/stats`);
  return response.data;
};

export const getFailedMessages = async (params: {
  campaign_id?: number;
  limit?: number;
} = {}) => {
  const response = await api.get('/queue/failed-messages', { params });
  return response.data;
};

export const triggerCleanup = async (params: {
  days?: number;
  dry_run?: boolean;
} = {}) => {
  const response = await api.post('/queue/cleanup', null, { params });
  return response.data;
};

export const getQueueHealth = async () => {
  const response = await api.get('/queue/health');
  return response.data;
};
