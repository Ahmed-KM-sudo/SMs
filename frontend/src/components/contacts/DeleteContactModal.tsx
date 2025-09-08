import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Contact } from '../../services/contactApi';

interface DeleteContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DeleteContactModal: React.FC<DeleteContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  onConfirm,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Delete Contact
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Are you sure?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone.
              </p>
            </div>
          </div>

          {contact && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You are about to delete the contact:
              </p>
              <div className="mt-2 space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {contact.prenom} {contact.nom}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {contact.numero_telephone}
                </p>
                {contact.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {contact.email}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isLoading ? 'Deleting...' : 'Delete Contact'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteContactModal;
