import React from 'react';
import AdvancedDashboard from '../components/analytics/AdvancedDashboard';
import CustomReportBuilder from '../components/analytics/CustomReportBuilder';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Advanced Analytics & BI</h1>
        <p className="text-gray-500">An overview of campaign performance and trends.</p>
      </div>
      <AdvancedDashboard />
      <CustomReportBuilder />
    </div>
  );
};

export default AnalyticsPage;
