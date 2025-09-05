import { Campaign } from '../../services/campaignApi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

interface CampaignAnalyticsProps {
  campaign: Campaign;
}

// Mock data for charts
const hourlyData = [
  { hour: '00:00', delivered: 50 }, { hour: '01:00', delivered: 75 },
  { hour: '02:00', delivered: 150 }, { hour: '03:00', delivered: 120 },
  { hour: '04:00', delivered: 200 }, { hour: '05:00', delivered: 180 },
];

const CampaignAnalytics = ({ campaign }: CampaignAnalyticsProps) => {
  const sent = campaign.sent_count || 0;
  const delivered = campaign.delivered_count || 0;
  const failed = campaign.failed_count || 0;
  const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
  const cost = (sent * 0.0075).toFixed(2); // Mock cost calculation

  const performanceData = [
    { name: 'Sent', value: sent },
    { name: 'Delivered', value: delivered },
    { name: 'Failed', value: failed },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campaign Analytics</h2>
        <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
          <Download className="w-4 h-4 mr-2" />
          Export Analytics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Delivery Rate</p>
          <p className="text-3xl font-bold">{deliveryRate.toFixed(1)}%</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Total Sent</p>
          <p className="text-3xl font-bold">{sent}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Estimated Cost</p>
          <p className="text-3xl font-bold">${cost}</p>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Performance Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Delivery Timeline (Hourly)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="delivered" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CampaignAnalytics;
