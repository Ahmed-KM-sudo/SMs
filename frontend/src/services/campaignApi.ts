import api from './api';

// I'll define the Campaign type here for now.
// In a larger app, this would go into a dedicated types file.
export interface Campaign {
  id: number;
  name: string;
  type: 'standard' | 'automated';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';
  template_id?: number;
  custom_message?: string;
  mailing_list_ids: number[];
  created_at: string;
  updated_at: string;
  scheduled_at?: string;
  sent_count?: number;
  delivered_count?: number;
  failed_count?: number;
}

export interface PaginatedCampaigns {
    items: Campaign[];
    total: number;
    page: number;
    size: number;
}

// Define params for fetching campaigns
export interface GetCampaignsParams {
    page?: number;
    size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    status?: string;
    type?: string;
    date_range?: string;
    search?: string;
}

const campaignApi = {
  getCampaigns: async (params: GetCampaignsParams): Promise<PaginatedCampaigns> => {
    const response = await api.get('/campaigns', { params });
    return response.data;
  },

  getCampaign: async (id: number): Promise<Campaign> => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (campaignData: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.post('/campaigns', campaignData);
    return response.data;
  },

  updateCampaign: async (id: number, campaignData: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.put(`/campaigns/${id}`, campaignData);
    return response.data;
  },

  deleteCampaign: async (id: number): Promise<void> => {
    await api.delete(`/campaigns/${id}`);
  },

  launchCampaign: async (id: number): Promise<Campaign> => {
    const response = await api.post(`/campaigns/${id}/launch`);
    return response.data;
  },

  pauseCampaign: async (id: number): Promise<Campaign> => {
    const response = await api.post(`/campaigns/${id}/pause`);
    return response.data;
  },

  resumeCampaign: async (id: number): Promise<Campaign> => {
    const response = await api.post(`/campaigns/${id}/resume`);
    return response.data;
  },
};

export default campaignApi;
