import React from 'react';
import { useMessages } from '../hooks/useMessages';
import MessagesTable from '../components/messages/MessagesTable';

const MessagesPage: React.FC = () => {
  const { data: messages, isLoading, isError } = useMessages();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      {isLoading && <p>Loading messages...</p>}
      {isError && <p className="text-red-500">Error loading messages.</p>}
      {!isLoading && !isError && <MessagesTable messages={messages || []} />}
    </div>
  );
};

export default MessagesPage;