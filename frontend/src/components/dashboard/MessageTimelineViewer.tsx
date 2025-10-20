import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Activity,
  Phone,
  MessageSquare,
  Calendar,
  Eye,
  Download
} from 'lucide-react';

interface MessageLog {
  id: number;
  queue_item_id: number;
  external_message_id?: string;
  status: string;
  provider_name?: string;
  provider_response?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
  queue_item?: {
    contact_phone: string;
    message_content: string;
    campaign_id?: number;
  };
}

interface SearchFilters {
  phone_number?: string;
  status?: string;
  provider?: string;
  date_from?: string;
  date_to?: string;
}

const MessageTimelineViewer: React.FC = () => {
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Search filters
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (filters.phone_number) params.append('phone_number', filters.phone_number);
      if (filters.status) params.append('status', filters.status);
      if (filters.provider) params.append('provider', filters.provider);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      params.append('limit', '100');

      const response = await fetch(`/api/v1/messages/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch message logs');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      // CSV Header
      ['ID', 'Phone', 'Status', 'Provider', 'External ID', 'Created', 'Error Message'].join(','),
      // CSV Data
      ...messages.map(msg => [
        msg.id,
        `"${msg.queue_item?.contact_phone || ''}"`,
        `"${msg.status}"`,
        `"${msg.provider_name || ''}"`,
        `"${msg.external_message_id || ''}"`,
        `"${new Date(msg.created_at).toLocaleString()}"`,
        `"${msg.error_message || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `message_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchMessages();
  }, [filters]);

  const filteredMessages = messages.filter(msg => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.queue_item?.contact_phone?.includes(query) ||
      msg.status.toLowerCase().includes(query) ||
      msg.provider_name?.toLowerCase().includes(query) ||
      msg.external_message_id?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm';
      case 'sent': return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm';
      case 'delivered': return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm';
      case 'failed': return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm';
      case 'undelivered': return 'bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm';
      default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'sent': return <CheckCircle className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'undelivered': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateMessage = (message: string, maxLength: number = 60) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Message Timeline</h1>
          <p className="text-gray-600">Track message delivery status and provider responses</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2 inline" />
            Export CSV
          </button>
          <button
            onClick={fetchMessages}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Phone, status, provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="Filter by phone"
              value={filters.phone_number || ''}
              onChange={(e) => setFilters({ ...filters, phone_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="undelivered">Undelivered</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Message Timeline */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Message Logs ({filteredMessages.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    External ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusColor(message.status)}>
                        <span className="flex items-center">
                          {getStatusIcon(message.status)}
                          <span className="ml-1 capitalize">{message.status}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {message.queue_item?.contact_phone}
                          </div>
                          {message.queue_item?.campaign_id && (
                            <div className="text-sm text-gray-500">
                              Campaign: {message.queue_item.campaign_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900 max-w-xs">
                          {message.queue_item?.message_content 
                            ? truncateMessage(message.queue_item.message_content)
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {message.provider_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {message.external_message_id || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {formatDate(message.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowDetails(true);
                        }}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        <Eye className="h-3 w-3 mr-1 inline" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {filteredMessages.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No message logs found
            </div>
          )}
        </div>
      </div>

      {/* Message Details Modal */}
      {showDetails && selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Message Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message ID</label>
                    <p className="text-sm text-gray-900">{selectedMessage.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Queue Item ID</label>
                    <p className="text-sm text-gray-900">{selectedMessage.queue_item_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={getStatusColor(selectedMessage.status)}>
                      {getStatusIcon(selectedMessage.status)}
                      <span className="ml-1 capitalize">{selectedMessage.status}</span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provider</label>
                    <p className="text-sm text-gray-900">{selectedMessage.provider_name || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">External Message ID</label>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedMessage.external_message_id || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <p className="text-sm text-gray-900">
                    {selectedMessage.queue_item?.contact_phone || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Message Content</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedMessage.queue_item?.message_content || 'N/A'}
                  </p>
                </div>

                {selectedMessage.error_message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Error Message</label>
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      {selectedMessage.error_message}
                    </p>
                  </div>
                )}

                {selectedMessage.provider_response && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provider Response</label>
                    <pre className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedMessage.provider_response, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Updated At</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedMessage.updated_at)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageTimelineViewer;
