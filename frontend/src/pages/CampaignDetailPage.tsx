import { useParams } from 'react-router-dom';
import { useCampaign } from '../hooks/useCampaigns';
import CampaignMonitor from '../components/campaigns/CampaignMonitor';
import CampaignAnalytics from '../components/campaigns/CampaignAnalytics';

const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);

  const { data: campaign, isLoading, error } = useCampaign(campaignId);

  if (isLoading) return <div>Loading campaign details...</div>;
  if (error) return <div className="text-red-500">Error loading campaign.</div>;
  if (!campaign) return <div>Campaign not found.</div>;

  const isActive = campaign.status === 'sending' || campaign.status === 'paused';

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
      <p className="text-gray-600 mb-6">Status: <span className="font-semibold capitalize">{campaign.status}</span></p>

      {isActive ? (
        <CampaignMonitor campaign={campaign} />
      ) : (
        <CampaignAnalytics campaign={campaign} />
      )}
    </div>
  );
};

export default CampaignDetailPage;
