import React from 'react';
import { useMessageLogs } from '../hooks/useMessageLogs';
import MessageLogsTable from '../components/message-logs/MessageLogsTable';

const MessageLogsPage: React.FC = () => {
  const { data: messageLogs, isLoading, isError } = useMessageLogs();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Message Logs</h1>
      {isLoading && <p>Loading message logs...</p>}
      {isError && <p className="text-red-500">Error loading message logs.</p>}
      {!isLoading && !isError && <MessageLogsTable messageLogs={messageLogs || []} />}
    </div>
  );
};

export default MessageLogsPage;