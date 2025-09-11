import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart3, PieChart as PieChartIcon, TrendingUpIcon, RefreshCw } from 'lucide-react';
import { usePerformanceAnalytics } from '../../hooks/usePerformanceAnalytics';

interface PerformanceChartsProps {
  deliveryRate?: number;
  totalDelivered?: number;
  totalFailed?: number;
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ 
  deliveryRate: propDeliveryRate, 
  totalDelivered: propTotalDelivered, 
  totalFailed: propTotalFailed 
}) => {
  const [activeChart, setActiveChart] = useState<'delivery' | 'trend' | 'volume'>('delivery');
  
  // Fetch real analytics data
  const { data: analyticsData, isLoading, error, refetch } = usePerformanceAnalytics(30);
  
  // Use analytics data if available, otherwise fall back to props
  const deliveryRate = analyticsData?.delivery_rate ?? propDeliveryRate ?? 0;
  const totalDelivered = analyticsData?.total_delivered ?? propTotalDelivered ?? 0;
  const totalFailed = analyticsData?.total_failed ?? propTotalFailed ?? 0;

  // Use real data from API
  const deliveryData = [
    { name: 'Delivered', value: totalDelivered, fill: '#10B981' },
    { name: 'Failed', value: totalFailed, fill: '#EF4444' },
  ];

  const trendData = analyticsData?.monthly_trends || [
    { month: 'Jan', delivered: 0, failed: 0 },
    { month: 'Feb', delivered: 0, failed: 0 },
    { month: 'Mar', delivered: 0, failed: 0 },
    { month: 'Apr', delivered: 0, failed: 0 },
    { month: 'May', delivered: 0, failed: 0 },
    { month: 'Jun', delivered: 0, failed: 0 },
  ];

  const volumeData = analyticsData?.hourly_volumes || [
    { time: '00:00', volume: 0 },
    { time: '04:00', volume: 0 },
    { time: '08:00', volume: 0 },
    { time: '12:00', volume: 0 },
    { time: '16:00', volume: 0 },
    { time: '20:00', volume: 0 },
  ];

  const chartTabs = [
    { 
      id: 'delivery' as const, 
      label: 'Delivery Rate', 
      icon: PieChartIcon,
      color: 'text-blue-600 border-blue-600 bg-blue-50'
    },
    { 
      id: 'trend' as const, 
      label: 'Monthly Trend', 
      icon: BarChart3,
      color: 'text-green-600 border-green-600 bg-green-50'
    },
    { 
      id: 'volume' as const, 
      label: 'Daily Volume', 
      icon: TrendingUpIcon,
      color: 'text-purple-600 border-purple-600 bg-purple-50'
    },
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'delivery':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Messages']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'trend':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  formatter={(value, name) => [value.toLocaleString(), name === 'delivered' ? 'Delivered' : 'Failed']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#F9FAFB', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="delivered" fill="#10B981" name="delivered" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#EF4444" name="failed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'volume':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="time" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  formatter={(value) => [value.toLocaleString(), 'Messages']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#F9FAFB', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Interactive charts showing campaign performance metrics
              {analyticsData && (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  • Live data
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Chart Type Selector */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              {chartTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeChart === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChart(tab.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? `${tab.color} dark:text-white dark:bg-gray-600`
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative">
          {isLoading && !analyticsData && (
            <div className="h-80 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Loading analytics data...</span>
              </div>
            </div>
          )}
          
          {error && !analyticsData ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-2">Failed to load analytics data</p>
                <p className="text-sm text-gray-500 mb-4">
                  {error instanceof Error ? error.message : 'An unknown error occurred'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : null}
          
          {(!isLoading || analyticsData) && !error && renderChart()}
        </div>

        {/* Chart Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {deliveryRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Processed</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {(totalDelivered + totalFailed).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failure Rate</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {totalDelivered + totalFailed > 0 
                    ? ((totalFailed / (totalDelivered + totalFailed)) * 100).toFixed(1)
                    : '0'
                  }%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;
