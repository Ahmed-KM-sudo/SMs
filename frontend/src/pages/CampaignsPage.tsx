import { useState } from 'react';
import CampaignList from '../components/campaigns/CampaignList';
import { useCampaigns } from '../hooks/useCampaigns';
import { Plus } from 'lucide-react';
import { debounce } from 'lodash';
import Modal from '../components/common/Modal';
import CampaignWizard from '../components/campaigns/CampaignWizard';

const CampaignsPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Debounce the search input to avoid excessive API calls
  const debouncedSetSearch = debounce((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPage(1); // Reset to first page on new search
  }, 500);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'search') {
      debouncedSetSearch(value);
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
      setPage(1); // Reset to first page on filter change
    }
  };

  const { data, isLoading, error } = useCampaigns({
    page,
    size: 10,
    search: filters.search,
    status: filters.status,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
        <button
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Create Campaign
        </button>
      </div>

      <Modal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} title="Create New Campaign">
        <CampaignWizard onClose={() => setIsWizardOpen(false)} />
      </Modal>

      <div className="p-4 mb-6 bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            name="search"
            placeholder="Search by campaign name..."
            onChange={handleFilterChange}
            className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <select
            name="status"
            onChange={handleFilterChange}
            className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {isLoading && <div>Loading campaigns...</div>}
      {error && <div className="text-red-500">Error fetching campaigns.</div>}
      {data && <CampaignList campaigns={data.items} />}

      {/* TODO: Add pagination controls */}
    </div>
  );
};

export default CampaignsPage;
