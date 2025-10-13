import React from 'react';
import { useMessageTemplates } from '../hooks/useMessageTemplates';
import MessageTemplatesTable from '../components/templates/MessageTemplatesTable';

const TemplatesPage: React.FC = () => {
  const { data: templates, isLoading, isError } = useMessageTemplates();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Message Templates</h1>
      {isLoading && <p>Loading templates...</p>}
      {isError && <p className="text-red-500">Error loading templates.</p>}
      {!isLoading && !isError && <MessageTemplatesTable templates={templates || []} />}
    </div>
  );
};

export default TemplatesPage;