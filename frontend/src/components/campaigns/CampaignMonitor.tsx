import { Campaign } from '../../services/campaignApi';
import { Pause, Play } from 'lucide-react';
import { usePauseCampaign, useResumeCampaign } from '../../hooks/useCampaigns';
import toast from 'react-hot-toast';

interface CampaignMonitorProps {
  campaign: Campaign;
}

const CampaignMonitor = ({ campaign }: CampaignMonitorProps) => {
  // Assume counts are on the campaign object.
  const sent = campaign.sent_count || 0;
  const delivered = campaign.delivered_count || 0;
  const failed = campaign.failed_count || 0;
  // This logic assumes the backend provides a total number of recipients, which is more robust.
  // If not, we'd need to calculate it differently. For now, we'll assume a total exists or can be derived.
  // Let's assume the mailing_list_ids can be used to fetch a total count in a real scenario.
  // For this component, we'll just sum up the outcomes for a progress estimate.
  const totalOutcomes = sent + delivered + failed;
  const progress = totalOutcomes > 0 ? ((sent + delivered + failed) / totalOutcomes) * 100 : 0; // This progress logic is illustrative. A real total would be better.


  const pauseMutation = usePauseCampaign();
  const resumeMutation = useResumeCampaign();

  const handlePause = () => {
    pauseMutation.mutate(campaign.id, {
      onSuccess: () => toast.success('Campaign paused.'),
      onError: () => toast.error('Failed to pause campaign.'),
    });
  };

  const handleResume = () => {
    resumeMutation.mutate(campaign.id, {
      onSuccess: () => toast.success('Campaign resumed.'),
      onError: () => toast.error('Failed to resume campaign.'),
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campaign Monitor</h2>
        <div>
          {campaign.status === 'sending' && (
            <button onClick={handlePause} disabled={pauseMutation.isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md shadow-sm hover:bg-yellow-700 focus:outline-none">
              <Pause className="w-4 h-4 mr-2" />
              {pauseMutation.isLoading ? 'Pausing...' : 'Pause'}
            </button>
          )}
          {campaign.status === 'paused' && (
            <button onClick={handleResume} disabled={resumeMutation.isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none">
              <Play className="w-4 h-4 mr-2" />
              {resumeMutation.isLoading ? 'Resuming...' : 'Resume'}
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Sending Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
          <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-right text-sm text-gray-600 mt-1">{totalOutcomes} messages processed</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Sent</p>
          <p className="text-2xl font-bold">{sent}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="text-2xl font-bold">{delivered}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-2xl font-bold">{failed}</p>
        </div>
      </div>
      {/* Timeline chart would go here in a future step */}
    </div>
  );
};

export default CampaignMonitor;
