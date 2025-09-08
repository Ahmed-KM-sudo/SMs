import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreateContactList } from '../hooks/useContactLists';
import { ContactListCreate } from '../services/contactListApi';
import { useContacts } from '../hooks/useContacts';

interface CreateContactListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateContactListModal: React.FC<CreateContactListModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createContactListMutation = useCreateContactList();
  const { data: contacts } = useContacts({}, { skip: 0, limit: 1000 });
  
  const [formData, setFormData] = useState<ContactListCreate>({
    nom_liste: '',
    type_client: '',
    zone_geographique: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get unique values for dropdowns from existing contacts
  const uniqueTypes = [...new Set((contacts || []).map((contact: any) => contact.type_client).filter(Boolean))];
  const uniqueZones = [...new Set((contacts || []).map((contact: any) => contact.zone_geographique).filter(Boolean))];

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nom_liste: '',
        type_client: '',
        zone_geographique: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom_liste.trim()) {
      newErrors.nom_liste = 'Name is required';
    }

    if (!formData.type_client) {
      newErrors.type_client = 'Contact type is required';
    }

    if (!formData.zone_geographique) {
      newErrors.zone_geographique = 'Geographic zone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createContactListMutation.mutateAsync(formData);
      onClose();
    } catch (error) {
      console.error('Failed to create contact list:', error);
    }
  };

  const handleInputChange = (field: keyof ContactListCreate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Create New Contact List
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="nom_liste" className="block text-sm font-medium text-gray-700">
                  List Name *
                </label>
                <input
                  type="text"
                  id="nom_liste"
                  value={formData.nom_liste}
                  onChange={(e) => handleInputChange('nom_liste', e.target.value)}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.nom_liste ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter list name"
                />
                {errors.nom_liste && (
                  <p className="mt-1 text-sm text-red-600">{errors.nom_liste}</p>
                )}
              </div>

              {/* Contact Type */}
              <div>
                <label htmlFor="type_client" className="block text-sm font-medium text-gray-700">
                  Contact Type *
                </label>
                <select
                  id="type_client"
                  value={formData.type_client}
                  onChange={(e) => handleInputChange('type_client', e.target.value)}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.type_client ? 'border-red-300' : ''
                  }`}
                >
                  <option value="">Select contact type</option>
                  {uniqueTypes.map((type) => (
                    <option key={String(type)} value={String(type)}>
                      {String(type)}
                    </option>
                  ))}
                </select>
                {errors.type_client && (
                  <p className="mt-1 text-sm text-red-600">{errors.type_client}</p>
                )}
              </div>

              {/* Geographic Zone */}
              <div>
                <label htmlFor="zone_geographique" className="block text-sm font-medium text-gray-700">
                  Geographic Zone *
                </label>
                <select
                  id="zone_geographique"
                  value={formData.zone_geographique}
                  onChange={(e) => handleInputChange('zone_geographique', e.target.value)}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.zone_geographique ? 'border-red-300' : ''
                  }`}
                >
                  <option value="">Select geographic zone</option>
                  {uniqueZones.map((zone) => (
                    <option key={String(zone)} value={String(zone)}>
                      {String(zone)}
                    </option>
                  ))}
                </select>
                {errors.zone_geographique && (
                  <p className="mt-1 text-sm text-red-600">{errors.zone_geographique}</p>
                )}
              </div>

              {/* Info about matching contacts */}
              {formData.type_client && formData.zone_geographique && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This list will automatically include all contacts with type "{formData.type_client}" 
                    and zone "{formData.zone_geographique}".
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={createContactListMutation.isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createContactListMutation.isLoading ? 'Creating...' : 'Create List'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContactListModal;
