import React, { useState } from 'react';
import { useCampaigns } from '../../hooks/useCampaigns';
import { Calendar, Users, TrendingUp, AlertCircle, Eye, Edit, Play, Pause, MoreHorizontal, ChevronRight, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const RecentCampaigns: React.FC = () => {
  const { data: campaigns, isLoading, isError } = useCampaigns();
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled' | 'finished'>('all');
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Campaigns</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Campaigns</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">Failed to load campaigns</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-blue-600 hover:text-blue-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter campaigns
  const filteredCampaigns = campaigns?.filter(campaign => {
    if (filter === 'all') return true;
    return campaign.statut === filter;
  }).slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'finished':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'draft':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="h-4 w-4" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const handleCampaignClick = (campaignId: number) => {
    navigate(`/campaigns/${campaignId}`);
  };

  const handleViewCampaign = (campaignId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/campaigns/${campaignId}`);
  };

  const handleEditCampaign = (campaignId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/campaigns/${campaignId}/edit`);
  };

  const filterOptions = [
    { value: 'all', label: 'All Campaigns', count: campaigns?.length || 0 },
    { value: 'active', label: 'Active', count: campaigns?.filter(c => c.statut === 'active').length || 0 },
    { value: 'scheduled', label: 'Scheduled', count: campaigns?.filter(c => c.statut === 'scheduled').length || 0 },
    { value: 'finished', label: 'Finished', count: campaigns?.filter(c => c.statut === 'finished').length || 0 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Campaigns</h3>
        <div className="flex items-center space-x-2">
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 text-sm text-gray-700 dark:text-gray-300 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
            <Filter className="h-4 w-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          
          {/* View All Link */}
          <button
            onClick={() => navigate('/campaigns')}
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            View all
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
      
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'all' ? 'No campaigns found' : `No ${filter} campaigns`}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {filter === 'all' ? 'Create your first campaign to get started' : 'Try changing the filter'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => navigate('/campaigns/create')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Create Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => (
            <div 
              key={campaign.id_campagne} 
              className="group flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              onClick={() => handleCampaignClick(campaign.id_campagne)}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className={`p-2 rounded-full ${getStatusColor(campaign.statut)} transition-transform group-hover:scale-110`}>
                  {getStatusIcon(campaign.statut)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {campaign.nom_campagne}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(campaign.created_at), 'MMM dd, yyyy')}
                    </p>
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {campaign.type_campagne}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.statut)}`}>
                  {campaign.statut}
                </span>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleViewCampaign(campaign.id_campagne, e)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleEditCampaign(campaign.id_campagne, e)}
                    className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                    title="Edit campaign"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded transition-colors"
                    title="More options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Quick Actions Footer */}
      {filteredCampaigns.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredCampaigns.length} of {campaigns?.length || 0} campaigns
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/campaigns/create')}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                New Campaign
              </button>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <button
                onClick={() => navigate('/campaigns')}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Manage All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentCampaigns;
