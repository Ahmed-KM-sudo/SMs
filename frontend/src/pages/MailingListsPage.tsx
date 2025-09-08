import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  SortAsc, 
  Grid3X3, 
  List,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useMailingLists } from '../hooks/useMailingLists';
import { MailingList } from '../services/mailingListApi';
import MailingListCard from '../components/mailing-lists/MailingListCard';
import MailingListModal from '../components/mailing-lists/MailingListModal';
import MailingListDetailModal from '../components/mailing-lists/MailingListDetailModal';
import ContactManagementModal from '../components/mailing-lists/ContactManagementModal';

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'contacts' | 'created_at';

const MailingListsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState<MailingList | null>(null);
  const [viewingList, setViewingList] = useState<MailingList | null>(null);
  const [managingContactsList, setManagingContactsList] = useState<MailingList | null>(null);

  const { data: mailingLists, isLoading, isError } = useMailingLists();

  // Filter and sort mailing lists
  const filteredAndSortedLists = React.useMemo(() => {
    if (!mailingLists) return [];

    let filtered = mailingLists.filter((list: MailingList) =>
      list.nom_liste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (list.description && list.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    filtered.sort((a: MailingList, b: MailingList) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.nom_liste.localeCompare(b.nom_liste);
          break;
        case 'contacts':
          comparison = a.contacts.length - b.contacts.length;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [mailingLists, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (list: MailingList) => {
    setEditingList(list);
  };

  const handleView = (list: MailingList) => {
    setViewingList(list);
  };

  const handleManageContacts = (list: MailingList) => {
    setManagingContactsList(list);
    setViewingList(null); // Close detail modal if open
  };

  const getTotalContacts = () => {
    return mailingLists?.reduce((total: number, list: MailingList) => total + list.contacts.length, 0) || 0;
  };

  const getActiveListsCount = () => {
    return mailingLists?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error loading mailing lists</h3>
        <p className="text-gray-600 dark:text-gray-400">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 rounded-lg shadow-lg">
        <div className="px-6 py-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mailing Lists</h1>
              <p className="text-green-100">Organize and manage your contact lists for targeted campaigns.</p>
            </div>
            <Users className="h-12 w-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <List className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Lists</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{getActiveListsCount()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTotalContacts().toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. List Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getActiveListsCount() > 0 ? Math.round(getTotalContacts() / getActiveListsCount()) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search and Filter */}
          <div className="flex flex-1 space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search mailing lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Sort Controls */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleSort('name')}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  sortField === 'name'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('contacts')}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  sortField === 'contacts'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Contacts {sortField === 'contacts' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('created_at')}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  sortField === 'created_at'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Date {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

          {/* View Controls and Create Button */}
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex rounded-md border border-gray-300 dark:border-gray-600">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium rounded-l-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium rounded-r-md border-l transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create List
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {filteredAndSortedLists.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No lists found' : 'No mailing lists yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'Create your first mailing list to start organizing your contacts'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First List
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedLists.map((list: MailingList) => (
              <MailingListCard
                key={list.id_liste}
                mailingList={list}
                onEdit={handleEdit}
                onView={handleView}
                onManageContacts={handleManageContacts}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contacts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedLists.map((list: MailingList) => (
                    <tr key={list.id_liste} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {list.nom_liste}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {list.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">{list.contacts.length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(list.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(list)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleManageContacts(list)}
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <MailingListModal
        isOpen={showCreateModal || !!editingList}
        onClose={() => {
          setShowCreateModal(false);
          setEditingList(null);
        }}
        mailingList={editingList}
      />

      <MailingListDetailModal
        isOpen={!!viewingList}
        onClose={() => setViewingList(null)}
        mailingList={viewingList}
        onManageContacts={handleManageContacts}
      />

      <ContactManagementModal
        isOpen={!!managingContactsList}
        onClose={() => setManagingContactsList(null)}
        mailingList={managingContactsList}
      />
    </div>
  );
};

export default MailingListsPage;
