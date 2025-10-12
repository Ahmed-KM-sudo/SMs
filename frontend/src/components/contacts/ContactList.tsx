import React, { useState, useEffect } from 'react';
import { Contact } from '../../services/contactApi';
import { format } from 'date-fns';
import { MoreVertical, CheckCircle, XCircle } from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  isError: boolean;
  onSelectionChange: (selectedIds: number[]) => void;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, isLoading, isError, onSelectionChange }) => {
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);

  useEffect(() => {
    onSelectionChange(selectedContactIds);
  }, [selectedContactIds, onSelectionChange]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContactIds(contacts.map(c => c.id_contact));
    } else {
      setSelectedContactIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter(contactId => contactId !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }

  if (isError) {
    return <div>Error fetching contacts.</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="p-4">
              <input type="checkbox" onChange={handleSelectAll} />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Segment</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Opt-In</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Added</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {contacts.map((contact) => (
            <tr key={contact.id_contact} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedContactIds.includes(contact.id_contact)}
                  onChange={() => handleSelectOne(contact.id_contact)}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{contact.prenom} {contact.nom}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{contact.numero_telephone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{contact.segment || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {contact.statut_opt_in
                  ? <CheckCircle className="h-5 w-5 text-green-500" />
                  : <XCircle className="h-5 w-5 text-red-500" />}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{format(new Date(contact.created_at), 'PP')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination controls will go here */}
      <div className="p-4 border-t dark:border-gray-700">
        <p className="text-sm text-gray-500">Pagination placeholder</p>
      </div>
    </div>
  );
};

export default ContactList;
