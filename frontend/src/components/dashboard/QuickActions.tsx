import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, FileText, BarChart3, Upload, Send } from 'lucide-react';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'New Campaign',
      description: 'Create a new SMS campaign',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white',
      onClick: () => navigate('/campaigns'),
    },
    {
      title: 'Import Contacts',
      description: 'Upload contact list from CSV',
      icon: Upload,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white',
      onClick: () => navigate('/contacts'),
    },
    {
      title: 'New Template',
      description: 'Create message template',
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-white',
      onClick: () => navigate('/templates'),
    },
    {
      title: 'View Analytics',
      description: 'Campaign performance insights',
      icon: BarChart3,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      textColor: 'text-white',
      onClick: () => navigate('/analytics'),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`${action.color} ${action.textColor} p-4 rounded-lg transition-colors group hover:shadow-md`}
            >
              <div className="flex flex-col items-center text-center">
                <Icon className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">{action.title}</span>
                <span className="text-xs opacity-90 mt-1">{action.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
