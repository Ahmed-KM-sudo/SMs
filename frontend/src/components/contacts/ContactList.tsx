import React, { useState, useEffect, useRef } from 'react';
import { Contact } from '../../services/contactApi';
import { format } from 'date-fns';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  isError: boolean;
  onEditContact?: (contact: Contact) => void;
  onDeleteContact?: (contactId: number) => void;
  onViewContact?: (contact: Contact) => void;
}

const ContactList: React.FC<ContactListProps> = ({ 
  contacts, 
  isLoading, 
  isError, 
  onEditContact, 
  onDeleteContact, 
  onViewContact 
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (contactId: number) => {
    setOpenDropdownId(openDropdownId === contactId ? null : contactId);
  };

  const handleAction = (action: 'view' | 'edit' | 'delete', contact: Contact) => {
    setOpenDropdownId(null);
    
    switch (action) {
      case 'view':
        onViewContact?.(contact);
        break;
      case 'edit':
        onEditContact?.(contact);
        break;
      case 'delete':
        onDeleteContact?.(contact.id_contact);
        break;
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
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Zone</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Added</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {contacts.map((contact) => (
            <tr key={contact.id_contact} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{contact.prenom} {contact.nom}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{contact.numero_telephone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{contact.zone_geographique || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{contact.type_client || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{format(new Date(contact.created_at), 'PP')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => toggleDropdown(contact.id_contact)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="More actions"
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  {openDropdownId === contact.id_contact && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700 ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={() => handleAction('view', contact)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Eye size={16} className="mr-3 text-blue-500" />
                          View Contact
                        </button>
                        <button
                          onClick={() => handleAction('edit', contact)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        >
                          <Edit size={16} className="mr-3 text-green-500" />
                          Edit Contact
                        </button>
                        <button
                          onClick={() => handleAction('delete', contact)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} className="mr-3" />
                          Delete Contact
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
