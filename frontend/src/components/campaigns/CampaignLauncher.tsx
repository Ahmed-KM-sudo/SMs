import { Campaign } from '../../services/campaignApi';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface CampaignLauncherProps {
  campaign: Partial<Campaign>;
  onLaunch: () => void;
  onCancel: () => void;
}

const CampaignLauncher = ({ campaign, onLaunch, onCancel }: CampaignLauncherProps) => {
  const audienceCount = 1234; // Mock data
  const estimatedCost = 56.78; // Mock data

  const checks = [
    { name: 'Campaign Name', valid: !!campaign.name },
    { name: 'Message Template/Copy', valid: !!campaign.template_id || !!campaign.custom_message },
    { name: 'Target Audience', valid: (campaign.mailing_list_ids?.length || 0) > 0 },
  ];

  const allValid = checks.every(c => c.valid);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Pre-launch Checklist</h3>
        <ul className="mt-2 space-y-2">
          {checks.map(check => (
            <li key={check.name} className="flex items-center">
              {check.valid ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
              )}
              <span>{check.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-medium">Summary</h3>
        <div className="p-4 mt-2 bg-gray-50 rounded-lg">
          <p><strong>Target Audience:</strong> {audienceCount} contacts</p>
          <p><strong>Estimated Cost:</strong> ${estimatedCost.toFixed(2)}</p>
        </div>
      </div>

      <div className="pt-4 flex justify-end space-x-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={onLaunch} disabled={!allValid} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-400">
          Launch Now
        </button>
      </div>
    </div>
  );
};

export default CampaignLauncher;
