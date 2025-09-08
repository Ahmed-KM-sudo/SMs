import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Filter, 
  Search,
  Download,
  Upload,
  Users,
  CheckSquare,
  Square
} from 'lucide-react';
import { MailingList, Contact, BulkFilter } from '../../services/mailingListApi';
import { 
  useListContacts, 
  useAddContactsToList, 
  useRemoveContactsFromList,
  useBulkAddContactsByFilter,
  useBulkRemoveContactsByFilter 
} from '../../hooks/useMailingLists';
import { useContacts } from '../../hooks/useContacts';
import { Contact as ContactApiContact } from '../../services/contactApi';

interface ContactManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailingList: MailingList | null;
}

const ContactManagementModal: React.FC<ContactManagementModalProps> = ({
  isOpen,
  onClose,
  mailingList,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'add' | 'bulk'>('current');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkFilters, setBulkFilters] = useState<BulkFilter>({});

  const { data: listContacts, isLoading: listContactsLoading } = useListContacts(mailingList?.id_liste || 0);
  const { data: allContacts, isLoading: allContactsLoading } = useContacts({}, { limit: 1000 });
  
  const addContactsToList = useAddContactsToList();
  const removeContactsFromList = useRemoveContactsFromList();
  const bulkAddContacts = useBulkAddContactsByFilter();
  const bulkRemoveContacts = useBulkRemoveContactsByFilter();

  if (!isOpen || !mailingList) return null;

  // Convert ContactApiContact to Contact format for compatibility
  const convertContact = (contact: ContactApiContact): Contact => ({
    id_contact: contact.id_contact,
    nom: contact.nom,
    prenom: contact.prenom,
    numero_telephone: contact.numero_telephone,
    segment: contact.segment || undefined,
    zone_geographique: contact.zone_geographique || undefined,
    type_client: contact.type_client || undefined,
    statut_opt_in: contact.statut_opt_in,
  });

  // Filter contacts that are not in the current list
  const availableContacts = allContacts?.filter(
    (contact: ContactApiContact) => !listContacts?.some((listContact: Contact) => listContact.id_contact === contact.id_contact)
  ).map(convertContact) || [];

  // Filter contacts based on search term
  const filteredListContacts = listContacts?.filter((contact: Contact) =>
    `${contact.prenom} ${contact.nom} ${contact.numero_telephone}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredAvailableContacts = availableContacts.filter((contact: Contact) =>
    `${contact.prenom} ${contact.nom} ${contact.numero_telephone}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = (contacts: Contact[]) => {
    const contactIds = contacts.map(c => c.id_contact);
    const allSelected = contactIds.every(id => selectedContacts.includes(id));
    
    if (allSelected) {
      setSelectedContacts(prev => prev.filter(id => !contactIds.includes(id)));
    } else {
      setSelectedContacts(prev => [...new Set([...prev, ...contactIds])]);
    }
  };

  const handleAddSelected = async () => {
    if (selectedContacts.length === 0 || !mailingList) return;
    
    try {
      await addContactsToList.mutateAsync({ 
        listId: mailingList.id_liste, 
        contactIds: selectedContacts 
      });
      setSelectedContacts([]);
    } catch (error) {
      console.error('Error adding contacts:', error);
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedContacts.length === 0 || !mailingList) return;
    
    try {
      await removeContactsFromList.mutateAsync({ 
        listId: mailingList.id_liste, 
        contactIds: selectedContacts 
      });
      setSelectedContacts([]);
    } catch (error) {
      console.error('Error removing contacts:', error);
    }
  };

  const handleBulkAdd = async () => {
    if (!mailingList) return;
    
    try {
      await bulkAddContacts.mutateAsync({ 
        listId: mailingList.id_liste, 
        filters: bulkFilters 
      });
      setBulkFilters({});
    } catch (error) {
      console.error('Error bulk adding contacts:', error);
    }
  };

  const handleBulkRemove = async () => {
    if (!mailingList) return;
    
    try {
      await bulkRemoveContacts.mutateAsync({ 
        listId: mailingList.id_liste, 
        filters: bulkFilters 
      });
      setBulkFilters({});
    } catch (error) {
      console.error('Error bulk removing contacts:', error);
    }
  };

  const ContactTable: React.FC<{ contacts: Contact[]; showActions?: boolean }> = ({ 
    contacts, 
    showActions = true 
  }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {showActions && (
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSelectAll(contacts)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {contacts.every(c => selectedContacts.includes(c.id_contact)) ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Segment
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {contacts.map((contact) => (
            <tr key={contact.id_contact}>
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleSelectContact(contact.id_contact)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {selectedContacts.includes(contact.id_contact) ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {contact.prenom} {contact.nom}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {contact.numero_telephone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  contact.statut_opt_in 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {contact.statut_opt_in ? 'Opted In' : 'Opted Out'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {contact.segment || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manage Contacts: {mailingList.nom_liste}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Current list has {listContacts?.length || 0} contacts
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'current', label: 'Current Contacts', icon: Users },
                { id: 'add', label: 'Add Contacts', icon: Plus },
                { id: 'bulk', label: 'Bulk Operations', icon: Filter },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {activeTab === 'current' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Current Contacts ({filteredListContacts.length})
                  </h4>
                  {selectedContacts.length > 0 && (
                    <button
                      onClick={handleRemoveSelected}
                      disabled={removeContactsFromList.isLoading}
                      className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 transition-colors"
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Remove Selected ({selectedContacts.length})
                    </button>
                  )}
                </div>

                {listContactsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading contacts...</p>
                  </div>
                ) : (
                  <ContactTable contacts={filteredListContacts} />
                )}
              </div>
            )}

            {activeTab === 'add' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Available Contacts ({filteredAvailableContacts.length})
                  </h4>
                  {selectedContacts.length > 0 && (
                    <button
                      onClick={handleAddSelected}
                      disabled={addContactsToList.isLoading}
                      className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Selected ({selectedContacts.length})
                    </button>
                  )}
                </div>

                {allContactsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading contacts...</p>
                  </div>
                ) : (
                  <ContactTable contacts={filteredAvailableContacts} />
                )}
              </div>
            )}

            {activeTab === 'bulk' && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Bulk Operations</h4>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter Criteria</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Segment
                      </label>
                      <input
                        type="text"
                        value={bulkFilters.segment || ''}
                        onChange={(e) => setBulkFilters(prev => ({ ...prev, segment: e.target.value || undefined }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Enter segment"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Geographic Zone
                      </label>
                      <input
                        type="text"
                        value={bulkFilters.zone_geographique || ''}
                        onChange={(e) => setBulkFilters(prev => ({ ...prev, zone_geographique: e.target.value || undefined }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Enter zone"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Opt-in Status
                      </label>
                      <select
                        value={bulkFilters.statut_opt_in === undefined ? '' : bulkFilters.statut_opt_in ? 'true' : 'false'}
                        onChange={(e) => setBulkFilters(prev => ({ 
                          ...prev, 
                          statut_opt_in: e.target.value === '' ? undefined : e.target.value === 'true' 
                        }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">Any</option>
                        <option value="true">Opted In</option>
                        <option value="false">Opted Out</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleBulkAdd}
                    disabled={bulkAddContacts.isLoading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {bulkAddContacts.isLoading ? 'Adding...' : 'Bulk Add by Filter'}
                  </button>
                  <button
                    onClick={handleBulkRemove}
                    disabled={bulkRemoveContacts.isLoading}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 transition-colors"
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    {bulkRemoveContacts.isLoading ? 'Removing...' : 'Bulk Remove by Filter'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManagementModal;
