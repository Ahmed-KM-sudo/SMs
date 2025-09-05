import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

const data = [
  { name: 'Campaign A', sent: 4000, failed: 2400 },
  { name: 'Campaign B', sent: 3000, failed: 1398 },
  { name: 'Campaign C', sent: 2000, failed: 9800 },
  { name: 'Campaign D', sent: 2780, failed: 3908 },
  { name: 'Campaign E', sent: 1890, failed: 4800 },
  { name: 'Campaign F', sent: 2390, failed: 3800 },
  { name: 'Campaign G', sent: 3490, failed: 4300 },
];

const DashboardPage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Campaigns</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">12</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Messages Sent</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">1,234</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Delivery Rate</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">95%</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Active Contacts</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">5,678</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800">Campaign Performance</h2>
        <div className="p-6 mt-4 bg-white rounded-lg shadow-md" style={{ width: '100%', height: 300 }}>
          {isClient && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#8884d8" />
                <Bar dataKey="failed" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
