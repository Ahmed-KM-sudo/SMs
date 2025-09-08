import React, { useState } from 'react';
import ContactList from '../components/contacts/ContactList';
import ContactFilters from '../components/contacts/ContactFilters';
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact } from '../hooks/useContacts';
import { Plus, Upload, X } from 'lucide-react';
import { ContactFilters as IContactFilters, Contact } from '../services/contactApi';
import ContactForm, { ContactFormInputs } from '../components/contacts/ContactForm';
import ContactImportWizard from '../components/contacts/ContactImportWizard';
import DeleteContactModal from '../components/contacts/DeleteContactModal';

const PAGE_SIZE = 15;

const ContactsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Partial<IContactFilters>>({});
  const [isAddContactModalOpen, setAddContactModalOpen] = useState(false);
  const [isEditContactModalOpen, setEditContactModalOpen] = useState(false);
  const [isViewContactModalOpen, setViewContactModalOpen] = useState(false);
  const [isDeleteContactModalOpen, setDeleteContactModalOpen] = useState(false);
  const [isImportWizardOpen, setImportWizardOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();
  const deleteContactMutation = useDeleteContact();

  const { data: contacts, isLoading, isError, isPreviousData, refetch } = useContacts(filters, {
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  const handleFilterChange = (newFilters: Partial<IContactFilters>) => {
    setPage(0);
    setFilters(newFilters);
  }

  const handleCreateContact = (data: ContactFormInputs) => {
    createContactMutation.mutate(data, {
      onSuccess: () => setAddContactModalOpen(false),
    });
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setEditContactModalOpen(true);
  };

  const handleUpdateContact = (data: ContactFormInputs) => {
    if (selectedContact) {
      updateContactMutation.mutate(
        { id: selectedContact.id_contact, payload: data },
        {
          onSuccess: () => {
            setEditContactModalOpen(false);
            setSelectedContact(null);
          },
        }
      );
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setViewContactModalOpen(true);
  };

  const handleDeleteContact = (contactId: number) => {
    const contact = contacts?.find(c => c.id_contact === contactId);
    if (contact) {
      setSelectedContact(contact);
      setDeleteContactModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedContact) {
      deleteContactMutation.mutate(selectedContact.id_contact, {
        onSuccess: () => {
          setDeleteContactModalOpen(false);
          setSelectedContact(null);
        }
      });
    }
  };

  return (
    <div className="flex h-full">
      <aside className="w-1/4 p-4 border-r dark:border-gray-700 h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <ContactFilters filters={filters} onFilterChange={handleFilterChange} />
      </aside>

      <main className="w-3/4 p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Contact Database</h1>
          <div>
            <button onClick={() => setImportWizardOpen(true)} className="inline-flex items-center px-4 py-2 mr-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700">
              <Upload size={20} className="mr-2" />
              Import Contacts
            </button>
            <button onClick={() => setAddContactModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
              <Plus size={20} className="mr-2" />
              Add Contact
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ContactList
            contacts={contacts || []}
            isLoading={isLoading}
            isError={isError}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
            onViewContact={handleViewContact}
          />
        </div>

        <div className="mt-4 flex justify-between items-center">
          {/* Pagination controls */}
        </div>
      </main>

      {isAddContactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Contact</h3>
               <button 
                 onClick={() => setAddContactModalOpen(false)}
                 className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
               >
                 <X size={20} className="text-gray-500 dark:text-gray-400" />
               </button>
             </div>
             
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 mb-6">
               <p className="text-sm text-blue-700 dark:text-blue-300">
                 Create a new contact in your database. All fields marked with * are required.
               </p>
             </div>
             
             <ContactForm
               onSubmit={handleCreateContact}
               isSubmitting={createContactMutation.isLoading}
             />
          </div>
        </div>
      )}

      {isEditContactModalOpen && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Contact</h3>
               <button 
                 onClick={() => {
                   setEditContactModalOpen(false);
                   setSelectedContact(null);
                 }}
                 className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
               >
                 <X size={20} className="text-gray-500 dark:text-gray-400" />
               </button>
             </div>
             
             <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 mb-6">
               <p className="text-sm text-green-700 dark:text-green-300">
                 Editing contact: <span className="font-semibold">{selectedContact.prenom} {selectedContact.nom}</span>
               </p>
             </div>
             
             <ContactForm
               onSubmit={handleUpdateContact}
               defaultValues={{
                 prenom: selectedContact.prenom,
                 nom: selectedContact.nom,
                 numero_telephone: selectedContact.numero_telephone,
                 email: selectedContact.email || '',
                 type_client: selectedContact.type_client || '',
                 zone_geographique: selectedContact.zone_geographique || '',
               }}
               isSubmitting={updateContactMutation.isLoading}
             />
          </div>
        </div>
      )}

      {isViewContactModalOpen && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Details</h3>
               <button 
                 onClick={() => {
                   setViewContactModalOpen(false);
                   setSelectedContact(null);
                 }}
                 className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
               >
                 <X size={20} className="text-gray-500 dark:text-gray-400" />
               </button>
             </div>
             
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-6">
               <div className="flex items-center space-x-4">
                 <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                   {selectedContact.prenom.charAt(0)}{selectedContact.nom.charAt(0)}
                 </div>
                 <div>
                   <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                     {selectedContact.prenom} {selectedContact.nom}
                   </h4>
                   <p className="text-gray-600 dark:text-gray-300">{selectedContact.numero_telephone}</p>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                 <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                   <p className="text-lg font-mono text-gray-900 dark:text-white">{selectedContact.numero_telephone}</p>
                 </div>
                 
                 <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                   <p className="text-gray-900 dark:text-white">{selectedContact.email || 'Not provided'}</p>
                 </div>
                 
                 <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Type</label>
                   <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                     {selectedContact.type_client || 'Standard'}
                   </span>
                 </div>
               </div>
               
               <div className="space-y-4">
                 <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Geographic Zone</label>
                   <p className="text-gray-900 dark:text-white">{selectedContact.zone_geographique || 'Not specified'}</p>
                 </div>
                 
                 <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Added</label>
                   <p className="text-gray-900 dark:text-white">{new Date(selectedContact.created_at).toLocaleDateString('en-US', {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric',
                     hour: '2-digit',
                     minute: '2-digit'
                   })}</p>
                 </div>
                 
                 <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact ID</label>
                   <p className="text-sm font-mono text-gray-600 dark:text-gray-400">#{selectedContact.id_contact}</p>
                 </div>
               </div>
             </div>
             
             <div className="mt-6 flex justify-end space-x-3">
               <button
                 onClick={() => {
                   setViewContactModalOpen(false);
                   handleEditContact(selectedContact);
                 }}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 Edit Contact
               </button>
               <button
                 onClick={() => {
                   setViewContactModalOpen(false);
                   setSelectedContact(null);
                 }}
                 className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
               >
                 Close
               </button>
             </div>
          </div>
        </div>
      )}

      <ContactImportWizard
        isOpen={isImportWizardOpen}
        onClose={() => setImportWizardOpen(false)}
        onSuccess={() => refetch()}
      />

      <DeleteContactModal
        isOpen={isDeleteContactModalOpen}
        onClose={() => {
          setDeleteContactModalOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        onConfirm={handleConfirmDelete}
        isLoading={deleteContactMutation.isLoading}
      />
    </div>
  );
};

export default ContactsPage;
