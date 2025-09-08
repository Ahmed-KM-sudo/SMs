import React, { useState } from 'react';
import toast from 'react-hot-toast';

const METRICS = [
  { id: 'delivery_rate', name: 'Delivery Rate' },
  { id: 'total_contacts', name: 'Contact Lists' },
  { id: 'messages_sent', name: 'Messages Sent' },
];

const DIMENSIONS = [
  { id: 'campaign', name: 'By Campaign' },
  { id: 'segment', name: 'By Segment' },
  { id: 'date', name: 'By Date' },
];

const CustomReportBuilder: React.FC = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<string>('');

  const handleGenerateReport = () => {
    if (selectedMetrics.length === 0 || !selectedDimension) {
      toast.error('Please select at least one metric and one dimension.');
      return;
    }
    const reportConfig = {
      metrics: selectedMetrics,
      dimension: selectedDimension,
    };
    console.log('Generating report with config:', reportConfig);
    toast.success('Report generation request sent! (Simulation)');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-bold mb-4">Custom Report Builder</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Metrics</label>
          {METRICS.map(metric => (
            <div key={metric.id} className="flex items-center">
              <input type="checkbox" id={metric.id} value={metric.id} onChange={(e) => {
                const newSelection = e.target.checked
                  ? [...selectedMetrics, metric.id]
                  : selectedMetrics.filter(m => m !== metric.id);
                setSelectedMetrics(newSelection);
              }} />
              <label htmlFor={metric.id} className="ml-2">{metric.name}</label>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dimension</label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedDimension}
            onChange={(e) => setSelectedDimension(e.target.value)}
          >
            <option value="">Group By...</option>
            {DIMENSIONS.map(dim => <option key={dim.id} value={dim.id}>{dim.name}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleGenerateReport}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default CustomReportBuilder;
