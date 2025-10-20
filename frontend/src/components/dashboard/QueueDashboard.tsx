import React, { useState } from 'react';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trash2, 
  Filter,
  RefreshCw,
  Activity,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react';
import { 
  useQueueStats, 
  useQueueItems, 
  useCancelQueueItem, 
  useRetryQueueItem 
} from '../../hooks/useQueue';
import { QueueItem } from '../../services/queueApi';

const QueueDashboard: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [campaignFilter, setCampaignFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Hooks
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQueueStats();
  const { 
    data: queueItems, 
    isLoading: itemsLoading, 
    refetch: refetchItems 
  } = useQueueItems({
    status_filter: statusFilter || undefined,
    campaign_id: campaignFilter ? parseInt(campaignFilter) : undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });

  const cancelMutation = useCancelQueueItem();
  const retryMutation = useRetryQueueItem();

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      sent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };

    return styles[status as keyof typeof styles] || styles.pending;
  }; 

  // Priority badge styling
  const getPriorityBadge = (priority: number) => {
    if (priority <= 2) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'; // High
    if (priority <= 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'; // Medium
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'; // Low
  };

  const getPriorityText = (priority: number) => {
    if (priority <= 2) return 'High';
    if (priority <= 5) return 'Medium';
    return 'Low';
  };

  // Handle actions
  const handleCancel = (itemId: number) => {
    if (window.confirm('Are you sure you want to cancel this message?')) {
      cancelMutation.mutate(itemId);
    }
  };

  const handleRetry = (itemId: number) => {
    if (window.confirm('Are you sure you want to retry this message?')) {
      retryMutation.mutate(itemId);
    }
  };

  const handleRefresh = () => {
    refetchStats();
    refetchItems();
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            SMS Queue Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage SMS message queue in real-time
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={statsLoading || itemsLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${(statsLoading || itemsLoading) ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : stats?.total_pending || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : stats?.total_processing || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : stats?.total_sent || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : stats?.total_failed || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : `${(stats?.success_rate || 0).toFixed(1)}%`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <RotateCcw className="h-6 w-6 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Retry Rate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : `${(stats?.retry_rate || 0).toFixed(1)}%`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Processing</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : `${(stats?.average_processing_time || 0).toFixed(1)}s`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Campaign ID
              </label>
              <input
                type="number"
                placeholder="Filter by campaign..."
                value={campaignFilter}
                onChange={(e) => {
                  setCampaignFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setCampaignFilter('');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Items Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Queue Items</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {itemsLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading queue items...</p>
                  </td>
                </tr>
              ) : queueItems?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">No queue items found</p>
                  </td>
                </tr>
              ) : (
                queueItems?.map((item: QueueItem) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div>
                        <div className="font-medium">{item.contact_phone}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          Contact ID: {item.contact_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="max-w-xs truncate" title={item.message_content}>
                        {item.message_content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(item.priority)}`}>
                        {getPriorityText(item.priority)} ({item.priority})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.attempts}/{item.max_attempts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {(item.status === 'pending' || item.status === 'processing') && (
                          <button
                            onClick={() => handleCancel(item.id)}
                            disabled={cancelMutation.isLoading}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                            title="Cancel"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {item.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(item.id)}
                            disabled={retryMutation.isLoading}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                            title="Retry"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {queueItems && queueItems.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, queueItems.length)} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={queueItems.length < itemsPerPage}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueDashboard;