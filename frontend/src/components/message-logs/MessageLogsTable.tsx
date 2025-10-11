import React from 'react';
import { MessageLog } from '../../types';

interface MessageLogsTableProps {
  messageLogs: MessageLog[];
}

const MessageLogsTable: React.FC<MessageLogsTableProps> = ({ messageLogs }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Log ID</th>
            <th className="py-2 px-4 border-b">Message ID</th>
            <th className="py-2 px-4 border-b">Log Time</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Notes</th>
          </tr>
        </thead>
        <tbody>
          {messageLogs.map((log) => (
            <tr key={log.id_log}>
              <td className="py-2 px-4 border-b">{log.id_log}</td>
              <td className="py-2 px-4 border-b">{log.id_message}</td>
              <td className="py-2 px-4 border-b">{new Date(log.log_time).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">{log.statut_message}</td>
              <td className="py-2 px-4 border-b">{log.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MessageLogsTable;