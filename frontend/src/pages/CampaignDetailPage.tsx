import React from 'react';
import { useParams } from 'react-router-dom';
import { useCampaign } from '../hooks/useCampaigns';
import CampaignMonitor from '../components/campaigns/CampaignMonitor';
import CampaignAnalytics from '../components/campaigns/CampaignAnalytics';

const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const campaignId = parseInt(id || '0', 10);

  const { data: campaign, isLoading, isError } = useCampaign(campaignId);

  if (isLoading) return <p>Loading campaign details...</p>;
  if (isError || !campaign) return <p className="text-red-500">Error loading campaign.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{campaign.nom_campagne}</h1>
      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p><strong>Status:</strong> {campaign.statut}</p>
        <p><strong>Type:</strong> {campaign.type_campagne}</p>
        {/* more details */}
      </div>

      {campaign.statut === 'active' && <CampaignMonitor campaign={campaign} />}

      {(campaign.statut === 'finished' || campaign.statut === 'archived') && <CampaignAnalytics campaign={campaign} />}
    </div>
  );
};

export default CampaignDetailPage;
