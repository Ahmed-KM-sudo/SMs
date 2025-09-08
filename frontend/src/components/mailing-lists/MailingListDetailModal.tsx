import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Calendar, 
  BarChart3, 
  FileText, 
  Download,
  Plus,
  Minus,
  Filter,
  Eye
} from 'lucide-react';
import { MailingList, Contact } from '../../services/mailingListApi';
import { useListContacts, useListStatistics } from '../../hooks/useMailingLists';

interface MailingListDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailingList: MailingList | null;
  onManageContacts: (list: MailingList) => void;
}

const MailingListDetailModal: React.FC<MailingListDetailModalProps> = ({
  isOpen,
  onClose,
  mailingList,
  onManageContacts,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'statistics'>('overview');
  
  const { data: contacts, isLoading: contactsLoading } = useListContacts(mailingList?.id_liste || 0);
  const { data: statistics, isLoading: statsLoading } = useListStatistics(mailingList?.id_liste || 0);

  if (!isOpen || !mailingList) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mailingList.nom_liste}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Created on {formatDate(mailingList.created_at)}
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
                { id: 'overview', label: 'Overview', icon: FileText },
                { id: 'contacts', label: 'Contacts', icon: Users },
                { id: 'statistics', label: 'Statistics', icon: BarChart3 },
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
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</span>
                      </div>
                      <p className="text-gray-900 dark:text-white mt-1">{mailingList.nom_liste}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Contacts</span>
                      </div>
                      <p className="text-gray-900 dark:text-white mt-1">{mailingList.contacts.length}</p>
                    </div>
                  </div>
                  {mailingList.description && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h5>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {mailingList.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => onManageContacts(mailingList)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Contacts
                    </button>
                    <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                      <Download className="h-4 w-4 mr-2" />
                      Export Contacts
                    </button>
                    <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Campaign
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Contacts</h4>
                  <div className="flex space-x-2">
                    <button className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                    <button className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </button>
                  </div>
                </div>

                {contactsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading contacts...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {contacts?.slice(0, 10).map((contact: Contact) => (
                          <tr key={contact.id_contact}>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {contacts && contacts.length > 10 && (
                      <p className="text-center text-sm text-gray-500 mt-4">
                        Showing first 10 of {contacts.length} contacts
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Statistics</h4>
                
                {statsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading statistics...</p>
                  </div>
                ) : statistics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Contact Stats */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Total Contacts</h5>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{statistics.total_contacts}</p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Opted In</h5>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{statistics.opt_in_contacts}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {formatPercentage(statistics.opt_in_contacts, statistics.total_contacts)}
                      </p>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Opted Out</h5>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100">{statistics.opt_out_contacts}</p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {formatPercentage(statistics.opt_out_contacts, statistics.total_contacts)}
                      </p>
                    </div>

                    {/* Segments */}
                    {Object.keys(statistics.segments).length > 0 && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Segments</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(statistics.segments).map(([segment, count]) => (
                            <div key={segment} className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{segment}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{String(count)} contacts</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No statistics available</p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onManageContacts(mailingList)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Manage Contacts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailingListDetailModal;
