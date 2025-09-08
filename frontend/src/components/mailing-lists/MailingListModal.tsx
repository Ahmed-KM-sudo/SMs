import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MailingList, MailingListCreationPayload, MailingListUpdatePayload } from '../../services/mailingListApi';
import { useCreateMailingList, useUpdateMailingList } from '../../hooks/useMailingLists';
import { useCampaigns } from '../../hooks/useCampaigns';

interface MailingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailingList?: MailingList | null;
}

const MailingListModal: React.FC<MailingListModalProps> = ({
  isOpen,
  onClose,
  mailingList,
}) => {
  const [formData, setFormData] = useState({
    nom_liste: '',
    description: '',
    id_campagne: undefined as number | undefined,
  });

  const createMailingList = useCreateMailingList();
  const updateMailingList = useUpdateMailingList();
  const { data: campaigns } = useCampaigns();

  const isEditing = !!mailingList;

  useEffect(() => {
    if (isOpen) {
      if (mailingList) {
        setFormData({
          nom_liste: mailingList.nom_liste,
          description: mailingList.description || '',
          id_campagne: mailingList.id_campagne || undefined,
        });
      } else {
        setFormData({
          nom_liste: '',
          description: '',
          id_campagne: campaigns?.[0]?.id_campagne || undefined,
        });
      }
    }
  }, [isOpen, mailingList, campaigns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && mailingList) {
        const updatePayload: MailingListUpdatePayload = {
          nom_liste: formData.nom_liste,
          description: formData.description || undefined,
        };
        await updateMailingList.mutateAsync({ 
          listId: mailingList.id_liste, 
          payload: updatePayload 
        });
      } else {
        const createPayload: MailingListCreationPayload = {
          nom_liste: formData.nom_liste,
          description: formData.description || undefined,
          id_campagne: formData.id_campagne,
        };
        await createMailingList.mutateAsync(createPayload);
      }
      onClose();
    } catch (error) {
      console.error('Error saving mailing list:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'id_campagne' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Mailing List' : 'Create Mailing List'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="nom_liste" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  List Name *
                </label>
                <input
                  type="text"
                  id="nom_liste"
                  name="nom_liste"
                  value={formData.nom_liste}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter list name"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description (optional)"
                />
              </div>

              {/* Campaign (optional) */}
              <div>
                <label htmlFor="id_campagne" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Campaign (Optional)
                </label>
                <select
                  id="id_campagne"
                  name="id_campagne"
                  value={formData.id_campagne || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No campaign</option>
                  {campaigns?.map((campaign) => (
                    <option key={campaign.id_campagne} value={campaign.id_campagne}>
                      {campaign.nom_campagne}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMailingList.isLoading || updateMailingList.isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
              >
                {createMailingList.isLoading || updateMailingList.isLoading
                  ? 'Saving...'
                  : isEditing
                  ? 'Update List'
                  : 'Create List'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MailingListModal;
