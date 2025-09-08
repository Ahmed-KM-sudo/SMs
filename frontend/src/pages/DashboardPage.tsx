import React, { useState } from 'react';
import { useDashboardStats } from '../hooks/useDashboard';
import { useContactLists } from '../hooks/useContactLists';
import { useMailingLists } from '../hooks/useMailingLists';
import StatsCard from '../components/dashboard/StatsCard';
import PerformanceCharts from '../components/dashboard/PerformanceCharts';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Activity,
  RefreshCw,
  Bell,
  Settings,
  UserCheck,
  Mail
} from 'lucide-react';
import { useQueryClient } from 'react-query';

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading, isError, dataUpdatedAt } = useDashboardStats();
  const { data: contactLists, isLoading: contactListsLoading } = useContactLists();
  const { data: mailingLists, isLoading: mailingListsLoading } = useMailingLists();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate additional metrics
  const costPerMessage = stats && stats.total_sms_sent > 0 
    ? stats.total_cost / stats.total_sms_sent 
    : 0;

  const successRate = stats ? stats.overall_delivery_rate : 0;

  // Calculate list statistics
  const totalContactLists = contactLists ? contactLists.length : 0;
  const totalMailingLists = mailingLists ? mailingLists.length : 0;
  
  // Calculate total contacts across all contact lists
  const totalContactsInLists = contactLists ? 
    contactLists.reduce((sum, list) => sum + (list.contacts?.length || 0), 0) : 0;
    
  // Calculate total contacts across all mailing lists
  const totalContactsInMailingLists = mailingLists ? 
    mailingLists.reduce((sum, list) => sum + (list.contacts?.length || 0), 0) : 0;

  // Manual refresh function
  const handleRefresh = async () => {
    setLastRefresh(new Date());
    await Promise.all([
      queryClient.invalidateQueries('dashboard-stats'),
      queryClient.invalidateQueries(['contactLists']),
      queryClient.invalidateQueries(['mailingLists'])
    ]);
  };

  // Calculate time since last update
  const getTimeSinceUpdate = () => {
    if (!dataUpdatedAt) return '';
    const now = new Date();
    const updated = new Date(dataUpdatedAt);
    const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
    
    if (diffInMinutes === 0) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg shadow-lg">
        <div className="px-6 py-8 text-white text-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome to SMS Platform</h1>
            <p className="text-blue-100">Welcome back! Here's an overview of your SMS campaigns performance.</p>
            <div className="flex items-center justify-center mt-3 text-blue-200 text-sm">
              <Activity className="h-4 w-4 mr-2" />
              <span>Last updated: {getTimeSinceUpdate()}</span>
              {isLoading && (
                <div className="ml-2 flex items-center">
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  <span>Updating...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Campaigns"
          value={stats?.total_campaigns ?? 0}
          icon={BarChart3}
          color="blue"
          loading={isLoading}
          trend={{
            value: 12.5,
            label: 'from last month'
          }}
        />
        <StatsCard
          title="Total Contacts"
          value={stats?.total_contacts.toLocaleString() ?? '0'}
          icon={Users}
          color="green"
          loading={isLoading}
          trend={{
            value: 8.3,
            label: 'from last month'
          }}
        />
        <StatsCard
          title="Messages Sent"
          value={stats?.total_sms_sent.toLocaleString() ?? '0'}
          icon={MessageSquare}
          color="purple"
          loading={isLoading}
          trend={{
            value: 23.1,
            label: 'from last month'
          }}
        />
        <StatsCard
          title="Contact Lists"
          value={totalContactLists.toLocaleString()}
          icon={UserCheck}
          color="yellow"
          loading={contactListsLoading}
          trend={{
            value: totalContactLists > 0 ? 8.5 : 0,
            label: `${totalContactsInLists} total contacts`
          }}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Delivery Rate"
          value={stats ? formatPercentage(stats.overall_delivery_rate) : '0%'}
          icon={TrendingUp}
          color="green"
          loading={isLoading}
          trend={{
            value: 2.1,
            label: 'from last month'
          }}
        />
        <StatsCard
          title="Successfully Delivered"
          value={stats?.total_messages_delivered.toLocaleString() ?? '0'}
          icon={CheckCircle}
          color="green"
          loading={isLoading}
          trend={{
            value: 18.7,
            label: 'from last month'
          }}
        />
        <StatsCard
          title="Failed Messages"
          value={stats?.total_messages_failed.toLocaleString() ?? '0'}
          icon={XCircle}
          color="red"
          loading={isLoading}
          trend={{
            value: -5.3,
            label: 'from last month'
          }}
        />
        <StatsCard
          title="Mailing Lists"
          value={totalMailingLists.toLocaleString()}
          icon={Mail}
          color="indigo"
          loading={mailingListsLoading}
          trend={{
            value: totalMailingLists > 0 ? 5.2 : 0,
            label: `${totalContactsInMailingLists} total contacts`
          }}
        />
      </div>

      {/* Charts Section */}
      {stats && !isLoading && (
        <PerformanceCharts
          deliveryRate={stats.overall_delivery_rate}
          totalDelivered={stats.total_messages_delivered}
          totalFailed={stats.total_messages_failed}
        />
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Unable to load dashboard data
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Please check your connection and try refreshing the page.
              </p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm text-red-800 dark:text-red-200 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Status Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`flex items-center px-3 py-2 rounded-full text-sm font-medium shadow-lg transition-all ${
          isLoading 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' 
            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isLoading ? 'bg-blue-600 animate-pulse' : 'bg-green-600'
          }`}></div>
          {isLoading ? 'Updating...' : 'Live'}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
