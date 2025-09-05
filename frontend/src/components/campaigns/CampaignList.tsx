import { Campaign } from '../../services/campaignApi';
import { MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface CampaignListProps {
  campaigns: Campaign[];
}

const statusColors: { [key: string]: string } = {
  draft: 'bg-gray-200 text-gray-800',
  scheduled: 'bg-blue-200 text-blue-800',
  sending: 'bg-yellow-200 text-yellow-800',
  sent: 'bg-green-200 text-green-800',
  paused: 'bg-purple-200 text-purple-800',
  failed: 'bg-red-200 text-red-800',
};

const CampaignList = ({ campaigns }: CampaignListProps) => {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow-sm">
        No campaigns found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Type</th>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Created At</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link to={`/campaigns/${campaign.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                  {campaign.name}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={clsx(
                  'inline-flex px-2 text-xs font-semibold leading-5 capitalize rounded-full',
                  statusColors[campaign.status] || 'bg-gray-200 text-gray-800'
                )}>
                  {campaign.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 capitalize whitespace-nowrap">{campaign.type}</td>
              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                {format(new Date(campaign.created_at), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                {/* Actions Dropdown would go here */}
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignList;
