import React from 'react';
import { useCampaignStatus } from '../../hooks/useCampaigns';
import { Campaign, CampaignStatus } from '../../services/campaignApi';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CampaignAnalyticsProps {
  campaign: Campaign;
}

const COLORS = ['#16a34a', '#dc2626']; // Green for delivered, Red for failed

const CampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({ campaign }) => {
  // For now, we use the same status hook. A real app might have a different, more detailed report endpoint.
  const { data: status, isLoading, isError } = useCampaignStatus(campaign.id_campagne, {
    enabled: campaign.statut === 'finished' || campaign.statut === 'archived',
  });

  if (isLoading) return <p>Loading analytics...</p>;
  if (isError) return <p className="text-red-500">Could not load analytics.</p>;
  if (!status || status.total_messages === 0) return <p>No analytics data available for this campaign.</p>;

  const deliveryRate = status.total_messages > 0 ? (status.delivered / status.total_messages) * 100 : 0;
  const failureRate = status.total_messages > 0 ? (status.failed / status.total_messages) * 100 : 0;

  const pieData = [
    { name: 'Delivered', value: status.delivered },
    { name: 'Failed', value: status.failed },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-bold mb-4">Campaign Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500">Total Messages</p>
          <p className="text-2xl font-bold">{status.total_messages}</p>
        </div>
        <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
          <p className="text-sm text-green-600">Delivery Rate</p>
          <p className="text-2xl font-bold">{deliveryRate.toFixed(2)}%</p>
        </div>
        <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
          <p className="text-sm text-red-600">Failure Rate</p>
          <p className="text-2xl font-bold">{failureRate.toFixed(2)}%</p>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CampaignAnalytics;
