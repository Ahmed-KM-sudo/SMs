import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getMailingLists,
  getMailingList,
  createMailingList,
  updateMailingList,
  deleteMailingList,
  duplicateMailingList,
  getListContacts,
  addContactsToList,
  removeContactsFromList,
  bulkAddContactsByFilter,
  bulkRemoveContactsByFilter,
  getListStatistics,
  previewListCampaign,
  MailingListCreationPayload,
  MailingListUpdatePayload,
  BulkFilter,
  PreviewRequest
} from '../services/mailingListApi';
import toast from 'react-hot-toast';

// Query keys
export const mailingListKeys = {
  all: ['mailingLists'] as const,
  lists: () => [...mailingListKeys.all, 'list'] as const,
  list: (id: number) => [...mailingListKeys.lists(), id] as const,
  contacts: (id: number) => [...mailingListKeys.list(id), 'contacts'] as const,
  statistics: (id: number) => [...mailingListKeys.list(id), 'statistics'] as const,
};

// Get all mailing lists
export const useMailingLists = () => {
  return useQuery(mailingListKeys.lists(), getMailingLists, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single mailing list
export const useMailingList = (listId: number) => {
  return useQuery(
    mailingListKeys.list(listId),
    () => getMailingList(listId),
    {
      enabled: !!listId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};

// Get list contacts
export const useListContacts = (listId: number) => {
  return useQuery(
    mailingListKeys.contacts(listId),
    () => getListContacts(listId),
    {
      enabled: !!listId,
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  );
};

// Get list statistics
export const useListStatistics = (listId: number) => {
  return useQuery(
    mailingListKeys.statistics(listId),
    () => getListStatistics(listId),
    {
      enabled: !!listId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};

// Create mailing list mutation
export const useCreateMailingList = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (payload: MailingListCreationPayload) => createMailingList(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(mailingListKeys.lists());
        toast.success('Mailing list created successfully!');
      },
      onError: (error: Error) => {
        toast.error(`Failed to create mailing list: ${error.message}`);
      },
    }
  );
};

// Update mailing list mutation
export const useUpdateMailingList = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ listId, payload }: { listId: number; payload: MailingListUpdatePayload }) =>
      updateMailingList(listId, payload),
    {
      onSuccess: (_data: any, { listId }: { listId: number }) => {
        queryClient.invalidateQueries(mailingListKeys.list(listId));
        queryClient.invalidateQueries(mailingListKeys.lists());
        toast.success('Mailing list updated successfully!');
      },
      onError: (error: Error) => {
        toast.error(`Failed to update mailing list: ${error.message}`);
      },
    }
  );
};

// Delete mailing list mutation
export const useDeleteMailingList = () => {
  const queryClient = useQueryClient();
  
  return useMutation((listId: number) => deleteMailingList(listId), {
    onSuccess: () => {
      queryClient.invalidateQueries(mailingListKeys.lists());
      toast.success('Mailing list deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete mailing list: ${error.message}`);
    },
  });
};

// Duplicate mailing list mutation
export const useDuplicateMailingList = () => {
  const queryClient = useQueryClient();
  
  return useMutation((listId: number) => duplicateMailingList(listId), {
    onSuccess: () => {
      queryClient.invalidateQueries(mailingListKeys.lists());
      toast.success('Mailing list duplicated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate mailing list: ${error.message}`);
    },
  });
};

// Add contacts to list mutation
export const useAddContactsToList = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ listId, contactIds }: { listId: number; contactIds: number[] }) =>
      addContactsToList(listId, contactIds),
    {
      onSuccess: (_data: any, { listId }: { listId: number }) => {
        queryClient.invalidateQueries(mailingListKeys.contacts(listId));
        queryClient.invalidateQueries(mailingListKeys.list(listId));
        queryClient.invalidateQueries(mailingListKeys.statistics(listId));
        toast.success('Contacts added to list successfully!');
      },
      onError: (error: Error) => {
        toast.error(`Failed to add contacts: ${error.message}`);
      },
    }
  );
};

// Remove contacts from list mutation
export const useRemoveContactsFromList = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ listId, contactIds }: { listId: number; contactIds: number[] }) =>
      removeContactsFromList(listId, contactIds),
    {
      onSuccess: (_data: any, { listId }: { listId: number }) => {
        queryClient.invalidateQueries(mailingListKeys.contacts(listId));
        queryClient.invalidateQueries(mailingListKeys.list(listId));
        queryClient.invalidateQueries(mailingListKeys.statistics(listId));
        toast.success('Contacts removed from list successfully!');
      },
      onError: (error: Error) => {
        toast.error(`Failed to remove contacts: ${error.message}`);
      },
    }
  );
};

// Bulk add contacts by filter mutation
export const useBulkAddContactsByFilter = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ listId, filters }: { listId: number; filters: BulkFilter }) =>
      bulkAddContactsByFilter(listId, filters),
    {
      onSuccess: (_data: any, { listId }: { listId: number }) => {
        queryClient.invalidateQueries(mailingListKeys.contacts(listId));
        queryClient.invalidateQueries(mailingListKeys.list(listId));
        queryClient.invalidateQueries(mailingListKeys.statistics(listId));
        toast.success('Contacts added to list by filter successfully!');
      },
      onError: (error: Error) => {
        toast.error(`Failed to add contacts by filter: ${error.message}`);
      },
    }
  );
};

// Bulk remove contacts by filter mutation
export const useBulkRemoveContactsByFilter = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ listId, filters }: { listId: number; filters: BulkFilter }) =>
      bulkRemoveContactsByFilter(listId, filters),
    {
      onSuccess: (_data: any, { listId }: { listId: number }) => {
        queryClient.invalidateQueries(mailingListKeys.contacts(listId));
        queryClient.invalidateQueries(mailingListKeys.list(listId));
        queryClient.invalidateQueries(mailingListKeys.statistics(listId));
        toast.success('Contacts removed from list by filter successfully!');
      },
      onError: (error: Error) => {
        toast.error(`Failed to remove contacts by filter: ${error.message}`);
      },
    }
  );
};

// Preview campaign mutation
export const usePreviewListCampaign = () => {
  return useMutation(
    ({ listId, request }: { listId: number; request: PreviewRequest }) =>
      previewListCampaign(listId, request),
    {
      onError: (error: Error) => {
        toast.error(`Failed to preview campaign: ${error.message}`);
      },
    }
  );
};
