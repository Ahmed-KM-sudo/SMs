import React from 'react';
import { ContactFilters as IContactFilters } from '../../services/contactApi';

interface ContactFiltersProps {
  filters: Partial<IContactFilters>;
  onFilterChange: (filters: Partial<IContactFilters>) => void;
}

const ContactFilters: React.FC<ContactFiltersProps> = ({ filters, onFilterChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  // Contact type options - same as in ContactForm
  const contactTypes = [
    { value: '', label: 'All Contact Types' },
    { value: 'individual', label: 'Individual' },
    { value: 'business', label: 'Business' },
    { value: 'lead', label: 'Lead' },
    { value: 'customer', label: 'Customer' },
    { value: 'partner', label: 'Partner' },
    { value: 'vendor', label: 'Vendor' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
        <input
          type="text"
          id="search"
          name="search"
          value={filters.search || ''}
          placeholder="Search by name, email, phone..."
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="type_client" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Type</label>
        <select
          id="type_client"
          name="type_client"
          value={filters.type_client || ''}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
        >
          {contactTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="zone_geographique" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Geographic Zone</label>
        <input
          type="text"
          id="zone_geographique"
          name="zone_geographique"
          value={filters.zone_geographique || ''}
          placeholder="Filter by zone..."
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
        />
      </div>
    </div>
  );
};

export default ContactFilters;
