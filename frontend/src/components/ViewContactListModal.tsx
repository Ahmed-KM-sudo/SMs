import React, { useState, useEffect } from 'react';
import { X, Users, Eye, Plus, Minus, Calendar } from 'lucide-react';
import { ContactList } from '../services/contactListApi';
import { useContactList, useAddContactsToList, useRemoveContactsFromList, useAvailableContactsForList } from '../hooks/useContactLists';

interface ViewContactListModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactList: ContactList;
  initialTab?: 'current' | 'available';
}

const ViewContactListModal: React.FC<ViewContactListModalProps> = ({
  isOpen,
  onClose,
  contactList,
  initialTab = 'current',
}) => {
  const { data: listDetails } = useContactList(contactList.id_contact_list);
  const { data: availableContacts } = useAvailableContactsForList(contactList.id_contact_list);
  const addContactsMutation = useAddContactsToList();
  const removeContactsMutation = useRemoveContactsFromList();
  
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectedAvailableContacts, setSelectedAvailableContacts] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'available'>(initialTab);

  // Reset to initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSelectedContacts([]);
      setSelectedAvailableContacts([]);
    }
  }, [isOpen, initialTab]);

  const handleSelectContact = (contactId: number, isAvailable: boolean) => {
    if (isAvailable) {
      setSelectedAvailableContacts(prev =>
        prev.includes(contactId)
          ? prev.filter(id => id !== contactId)
          : [...prev, contactId]
      );
    } else {
      setSelectedContacts(prev =>
        prev.includes(contactId)
          ? prev.filter(id => id !== contactId)
          : [...prev, contactId]
      );
    }
  };

  const handleAddContacts = async () => {
    if (selectedAvailableContacts.length === 0) return;
    
    try {
      await addContactsMutation.mutateAsync({
        listId: contactList.id_contact_list,
        contactIds: selectedAvailableContacts,
      });
      setSelectedAvailableContacts([]);
    } catch (error) {
      console.error('Failed to add contacts:', error);
    }
  };

  const handleRemoveContacts = async () => {
    if (selectedContacts.length === 0) return;
    
    try {
      await removeContactsMutation.mutateAsync({
        listId: contactList.id_contact_list,
        contactIds: selectedContacts,
      });
      setSelectedContacts([]);
    } catch (error) {
      console.error('Failed to remove contacts:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl leading-6 font-bold text-gray-900">
                  {contactList.nom_liste}
                </h3>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {listDetails?.contacts?.length || 0} contacts
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created {formatDate(contactList.created_at)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* List Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Contact Type:</span>
                  <p className="text-sm font-semibold text-gray-900">{contactList.type_client}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Geographic Zone:</span>
                  <p className="text-sm font-semibold text-gray-900">{contactList.zone_geographique}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'current'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Current Contacts ({listDetails?.contacts?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('available')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'available'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Available to Add ({availableContacts?.length || 0})
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 max-h-96 overflow-y-auto">
            {activeTab === 'current' ? (
              <div>
                {/* Action bar for current contacts */}
                {selectedContacts.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-800">
                        {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                      </span>
                      <button
                        onClick={handleRemoveContacts}
                        disabled={removeContactsMutation.isLoading}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-3 w-3 mr-1" />
                        Remove from List
                      </button>
                    </div>
                  </div>
                )}

                {/* Current contacts list */}
                <div className="space-y-2">
                  {listDetails?.contacts?.length ? (
                    listDetails.contacts.map((contact) => (
                      <div
                        key={contact.id_contact}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedContacts.includes(contact.id_contact)
                            ? 'border-indigo-300 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectContact(contact.id_contact, false)}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id_contact)}
                            onChange={() => handleSelectContact(contact.id_contact, false)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {contact.nom} {contact.prenom}
                            </p>
                            <p className="text-xs text-gray-500">{contact.numero_telephone}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {contact.email}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts in this list</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Switch to the "Available to Add" tab to add contacts.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {/* Action bar for available contacts */}
                {selectedAvailableContacts.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-800">
                        {selectedAvailableContacts.length} contact{selectedAvailableContacts.length !== 1 ? 's' : ''} selected
                      </span>
                      <button
                        onClick={handleAddContacts}
                        disabled={addContactsMutation.isLoading}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add to List
                      </button>
                    </div>
                  </div>
                )}

                {/* Available contacts list */}
                <div className="space-y-2">
                  {availableContacts?.length ? (
                    availableContacts.map((contact) => (
                      <div
                        key={contact.id_contact}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedAvailableContacts.includes(contact.id_contact)
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectContact(contact.id_contact, true)}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedAvailableContacts.includes(contact.id_contact)}
                            onChange={() => handleSelectContact(contact.id_contact, true)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {contact.nom} {contact.prenom}
                            </p>
                            <p className="text-xs text-gray-500">{contact.numero_telephone}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {contact.email}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts available to add</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        All contacts matching the list criteria are already included.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewContactListModal;
