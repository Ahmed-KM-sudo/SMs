import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, Template } from '../services/templateApi';
import toast from 'react-hot-toast';

const TEMPLATES_QUERY_KEY = 'templates';

export const useTemplates = () => {
  return useQuery<Template[], Error>(TEMPLATES_QUERY_KEY, getTemplates);
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(createTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(TEMPLATES_QUERY_KEY);
      toast.success('Template created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    }
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(updateTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(TEMPLATES_QUERY_KEY);
      toast.success('Template updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    }
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(TEMPLATES_QUERY_KEY);
      toast.success('Template deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    }
  });
};
