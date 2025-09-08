import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  bulkUpdateOptStatus,
  importContacts,
  Contact,
  ContactFilters,
  Pagination
} from '../services/contactApi';
import toast from 'react-hot-toast';


const CONTACTS_QUERY_KEY = 'contacts';

export const useContacts = (filters: ContactFilters, pagination: Pagination) => {
  return useQuery<Contact[], Error>(
    [CONTACTS_QUERY_KEY, filters, pagination],
    () => getContacts({ filters, pagination }),
    {
      keepPreviousData: true,
    }
  );
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation(createContact, {
    onSuccess: () => {
      queryClient.invalidateQueries(CONTACTS_QUERY_KEY);
      toast.success('Contact created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create contact: ${error.message}`);
    }
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation(updateContact, {
    onSuccess: () => {
      queryClient.invalidateQueries(CONTACTS_QUERY_KEY);
      toast.success('Contact updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update contact: ${error.message}`);
    }
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteContact, {
    onSuccess: () => {
      queryClient.invalidateQueries(CONTACTS_QUERY_KEY);
      toast.success('Contact deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete contact: ${error.message}`);
    }
  });
};

export const useBulkUpdateOptStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(bulkUpdateOptStatus, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(CONTACTS_QUERY_KEY);
      toast.success(data.message || 'Contacts updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update contacts: ${error.message}`);
    }
  });
};

export const useImportContacts = () => {
  const queryClient = useQueryClient();
  return useMutation(importContacts, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(CONTACTS_QUERY_KEY);
      // Don't show toast here, let the component handle it based on the result
    },
    onError: (error: any) => {
      console.error('Import error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to import contacts';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  });
};
