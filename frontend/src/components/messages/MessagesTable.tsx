import React from 'react';
import { Message } from '../../types';

interface MessagesTableProps {
  messages: Message[];
}

const MessagesTable: React.FC<MessagesTableProps> = ({ messages }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Message ID</th>
            <th className="py-2 px-4 border-b">Content</th>
            <th className="py-2 px-4 border-b">Send Date</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Sender ID</th>
            <th className="py-2 px-4 border-b">External ID</th>
            <th className="py-2 px-4 border-b">Contact ID</th>
            <th className="py-2 px-4 border-b">Campaign ID</th>
            <th className="py-2 px-4 border-b">Mailing List ID</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr key={message.id_message}>
              <td className="py-2 px-4 border-b">{message.id_message}</td>
              <td className="py-2 px-4 border-b">{message.contenu}</td>
              <td className="py-2 px-4 border-b">{new Date(message.date_envoi).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">{message.statut_livraison}</td>
              <td className="py-2 px-4 border-b">{message.identifiant_expediteur}</td>
              <td className="py-2 px-4 border-b">{message.external_message_id}</td>
              <td className="py-2 px-4 border-b">{message.id_contact}</td>
              <td className="py-2 px-4 border-b">{message.id_campagne}</td>
              <td className="py-2 px-4 border-b">{message.id_liste_diffusion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MessagesTable;