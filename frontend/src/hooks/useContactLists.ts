import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getContactLists,
  getContactList,
  createContactList,
  updateContactList,
  deleteContactList,
  getContactListStatistics,
  getAvailableContactsForList,
  addContactsToList,
  removeContactsFromList,
  ContactListCreate,
  ContactListUpdate
} from '../services/contactListApi';
import toast from 'react-hot-toast';

// Query keys
export const contactListKeys = {
  all: ['contactLists'] as const,
  lists: () => [...contactListKeys.all, 'list'] as const,
  list: (id: number) => [...contactListKeys.lists(), id] as const,
  statistics: () => [...contactListKeys.all, 'statistics'] as const,
  availableContacts: (id: number) => [...contactListKeys.list(id), 'available-contacts'] as const,
};

// Get all contact lists
export const useContactLists = () => {
  return useQuery(contactListKeys.lists(), getContactLists, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single contact list
export const useContactList = (listId: number) => {
  return useQuery(
    contactListKeys.list(listId),
    () => getContactList(listId),
    {
      enabled: !!listId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};

// Get contact list statistics
export const useContactListStatistics = () => {
  return useQuery(contactListKeys.statistics(), getContactListStatistics, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get available contacts for a list
export const useAvailableContactsForList = (listId: number) => {
  return useQuery(
    contactListKeys.availableContacts(listId),
    () => getAvailableContactsForList(listId),
    {
      enabled: !!listId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};

// Create contact list
export const useCreateContactList = () => {
  const queryClient = useQueryClient();
  
  return useMutation(createContactList, {
    onSuccess: () => {
      queryClient.invalidateQueries(contactListKeys.lists());
      queryClient.invalidateQueries(contactListKeys.statistics());
      toast.success('Contact list created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create contact list: ${error.message}`);
    },
  });
};

// Update contact list
export const useUpdateContactList = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ listId, payload }: { listId: number; payload: ContactListUpdate }) =>
      updateContactList(listId, payload),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(contactListKeys.list(variables.listId));
        queryClient.invalidateQueries(contactListKeys.lists());
        queryClient.invalidateQueries(contactListKeys.statistics());
        toast.success('Contact list updated successfully!');
      },
      onError: (error: Error) => {
        toast.error(`Failed to update contact list: ${error.message}`);
      },
    }
  );
};

// Delete contact list
export const useDeleteContactList = () => {
  const queryClient = useQueryClient();
  
  return useMutation(deleteContactList, {
    onSuccess: () => {
      queryClient.invalidateQueries(contactListKeys.lists());
      queryClient.invalidateQueries(contactListKeys.statistics());
      toast.success('Contact list deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete contact list: ${error.message}`);
    },
  });
};

// Add contacts to list
export const useAddContactsToList = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ listId, contactIds }: { listId: number; contactIds: number[] }) =>
      addContactsToList(listId, contactIds),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(contactListKeys.list(variables.listId));
        queryClient.invalidateQueries(contactListKeys.lists());
        queryClient.invalidateQueries(contactListKeys.statistics());
        toast.success('Contacts added to list successfully!');
      },
      onError: (error: Error) => {
        toast.error(`Failed to add contacts to list: ${error.message}`);
      },
    }
  );
};

// Remove contacts from list
export const useRemoveContactsFromList = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ listId, contactIds }: { listId: number; contactIds: number[] }) =>
      removeContactsFromList(listId, contactIds),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(contactListKeys.list(variables.listId));
        queryClient.invalidateQueries(contactListKeys.lists());
        queryClient.invalidateQueries(contactListKeys.statistics());
        toast.success('Contacts removed from list successfully!');
      },
      onError: (error: Error) => {
        toast.error(`Failed to remove contacts from list: ${error.message}`);
      },
    }
  );
};
