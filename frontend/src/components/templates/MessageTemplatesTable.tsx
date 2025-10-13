import React from 'react';
import { MessageTemplate } from '../../types';

interface MessageTemplatesTableProps {
  templates: MessageTemplate[];
}

const MessageTemplatesTable: React.FC<MessageTemplatesTableProps> = ({ templates }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Template ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Content</th>
            <th className="py-2 px-4 border-b">Type</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.id_template}>
              <td className="py-2 px-4 border-b">{template.id_template}</td>
              <td className="py-2 px-4 border-b">{template.nom_template}</td>
              <td className="py-2 px-4 border-b">{template.contenu}</td>
              <td className="py-2 px-4 border-b">{template.type_template}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MessageTemplatesTable;