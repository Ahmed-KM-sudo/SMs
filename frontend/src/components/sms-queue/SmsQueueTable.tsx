import React from 'react';
import { SmsQueue } from '../../types';

interface SmsQueueTableProps {
  smsQueue: SmsQueue[];
}

const SmsQueueTable: React.FC<SmsQueueTableProps> = ({ smsQueue }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Queue ID</th>
            <th className="py-2 px-4 border-b">Message ID</th>
            <th className="py-2 px-4 border-b">Date Added</th>
            <th className="py-2 px-4 border-b">Priority</th>
            <th className="py-2 px-4 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {smsQueue.map((item) => (
            <tr key={item.id_queue}>
              <td className="py-2 px-4 border-b">{item.id_queue}</td>
              <td className="py-2 px-4 border-b">{item.id_message}</td>
              <td className="py-2 px-4 border-b">{new Date(item.date_ajout).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">{item.priorite}</td>
              <td className="py-2 px-4 border-b">{item.statut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SmsQueueTable;