import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  MoreVertical, 
  Edit2, 
  Copy, 
  Trash2, 
  Eye,
  Settings,
  FileText
} from 'lucide-react';
import { MailingList } from '../../services/mailingListApi';
import { useDeleteMailingList, useDuplicateMailingList } from '../../hooks/useMailingLists';

interface MailingListCardProps {
  mailingList: MailingList;
  onEdit: (list: MailingList) => void;
  onView: (list: MailingList) => void;
  onManageContacts: (list: MailingList) => void;
}

const MailingListCard: React.FC<MailingListCardProps> = ({
  mailingList,
  onEdit,
  onView,
  onManageContacts,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const deleteMailingList = useDeleteMailingList();
  const duplicateMailingList = useDuplicateMailingList();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${mailingList.nom_liste}"?`)) {
      deleteMailingList.mutate(mailingList.id_liste);
    }
    setShowMenu(false);
  };

  const handleDuplicate = async () => {
    duplicateMailingList.mutate(mailingList.id_liste);
    setShowMenu(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {mailingList.nom_liste}
          </h3>
          {mailingList.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {mailingList.description}
            </p>
          )}
        </div>
        <div className="relative ml-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              <button
                onClick={() => {
                  onView(mailingList);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </button>
              <button
                onClick={() => {
                  onEdit(mailingList);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => {
                  onManageContacts(mailingList);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Contacts
              </button>
              <button
                onClick={handleDuplicate}
                disabled={duplicateMailingList.isLoading}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleDelete}
                disabled={deleteMailingList.isLoading}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <Users className="h-4 w-4 text-blue-500 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {mailingList.contacts.length} contacts
          </span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(mailingList.created_at)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onView(mailingList)}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
        >
          <Eye className="h-4 w-4 inline mr-1" />
          View
        </button>
        <button
          onClick={() => onManageContacts(mailingList)}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <Settings className="h-4 w-4 inline mr-1" />
          Manage
        </button>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default MailingListCard;
