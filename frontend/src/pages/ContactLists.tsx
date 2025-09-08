import React, { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Users, Filter, UserPlus } from 'lucide-react';
import { useContactLists, useDeleteContactList } from '../hooks/useContactLists';
import { ContactList } from '../services/contactListApi';
import CreateContactListModal from '../components/CreateContactListModal';
import EditContactListModal from '../components/EditContactListModal';
import ViewContactListModal from '../components/ViewContactListModal';

const ContactLists: React.FC = () => {
  const { data: contactLists, isLoading, error } = useContactLists();
  const deleteContactListMutation = useDeleteContactList();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);
  const [viewModalInitialTab, setViewModalInitialTab] = useState<'current' | 'available'>('current');

  // Filter contact lists based on search and filters
  const filteredLists = contactLists?.filter((list) => {
    const matchesSearch = list.nom_liste.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || list.type_client === filterType;
    const matchesZone = !filterZone || list.zone_geographique === filterZone;
    return matchesSearch && matchesType && matchesZone;
  }) || [];

  // Get unique types and zones for filters
  const uniqueTypes = [...new Set(contactLists?.map(list => list.type_client) || [])];
  const uniqueZones = [...new Set(contactLists?.map(list => list.zone_geographique) || [])];

  const handleEdit = (list: ContactList) => {
    setSelectedList(list);
    setIsEditModalOpen(true);
  };

  const handleView = (list: ContactList) => {
    setSelectedList(list);
    setViewModalInitialTab('current');
    setIsViewModalOpen(true);
  };

  const handleAddContacts = (list: ContactList) => {
    setSelectedList(list);
    setViewModalInitialTab('available');
    setIsViewModalOpen(true);
    // The ViewContactListModal handles both viewing and adding contacts
  };

  const handleDelete = async (list: ContactList) => {
    if (window.confirm(`Are you sure you want to delete the contact list "${list.nom_liste}"?`)) {
      try {
        await deleteContactListMutation.mutateAsync(list.id_contact_list);
      } catch (error) {
        console.error('Failed to delete contact list:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">
          <h3 className="text-lg font-medium">Error loading contact lists</h3>
          <p className="mt-2 text-sm">{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="space-y-8">
        {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Contact Lists
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Manage your contact lists and organize contacts by type and zone
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="group relative inline-flex items-center px-6 py-3 overflow-hidden text-sm font-semibold text-white transition-all duration-300 ease-out bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <Plus className="h-5 w-5 mr-2 relative z-10" />
          <span className="relative z-10">Create New List</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search lists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 block w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12 transition-all duration-200"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12 bg-white transition-all duration-200"
            >
              <option value="">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Zone Filter */}
          <div className="relative">
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12 bg-white transition-all duration-200"
            >
              <option value="">All Zones</option>
              {uniqueZones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredLists.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-12 w-12 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No contact lists</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {contactLists?.length === 0 
                  ? "Get started by creating your first contact list to organize and manage your contacts effectively."
                  : "No lists match your current filters. Try adjusting your search criteria."
                }
              </p>
              {contactLists?.length === 0 && (
                <div>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="group relative inline-flex items-center px-8 py-4 overflow-hidden text-base font-semibold text-white transition-all duration-300 ease-out bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <Plus className="h-5 w-5 mr-2 relative z-10" />
                    <span className="relative z-10">Create Your First Contact List</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          filteredLists.map((list) => (
            <div
              key={list.id_contact_list}
              className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="relative">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl leading-6 font-bold text-white truncate">
                      {list.nom_liste}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(list)}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAddContacts(list)}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                        title="Add contacts"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(list)}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                        title="Edit list"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(list)}
                        className="text-white/80 hover:text-red-200 hover:bg-red-500/20 p-2 rounded-lg transition-all duration-200"
                        title="Delete list"
                        disabled={deleteContactListMutation.isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-6 py-5">
                  {/* Stats badges */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Users className="h-3 w-3 mr-1" />
                        {list.contacts?.length || 0} contacts
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(list.created_at)}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-600">Type</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 bg-white px-3 py-1 rounded-md shadow-sm">
                        {list.type_client}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-600">Zone</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 bg-white px-3 py-1 rounded-md shadow-sm">
                        {list.zone_geographique}
                      </span>
                    </div>
                  </div>

                  {/* Manage Contacts Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => handleAddContacts(list)}
                      className="w-full group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden text-sm font-semibold text-white transition-all duration-300 ease-out bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <UserPlus className="h-4 w-4 mr-2 relative z-10" />
                      <span className="relative z-10">Manage Contacts</span>
                    </button>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-20 transform rotate-45"></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <CreateContactListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedList && (
        <>
          <EditContactListModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedList(null);
            }}
            contactList={selectedList}
          />

          <ViewContactListModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedList(null);
            }}
            contactList={selectedList}
            initialTab={viewModalInitialTab}
          />
        </>
      )}
      </div>
    </div>
  );
};

export default ContactLists;
