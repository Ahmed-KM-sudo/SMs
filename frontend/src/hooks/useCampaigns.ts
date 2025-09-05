import { useQuery, useMutation, useQueryClient } from 'react-query';
import campaignApi, { GetCampaignsParams, Campaign } from '../services/campaignApi';

const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (params: GetCampaignsParams) => [...campaignKeys.lists(), params] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: number) => [...campaignKeys.details(), id] as const,
};

export const useCampaigns = (params: GetCampaignsParams) => {
  return useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: () => campaignApi.getCampaigns(params),
    keepPreviousData: true,
  });
};

export const useCampaign = (id: number) => {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignApi.getCampaign(id),
    enabled: !!id, // Only run the query if the id is truthy
    // Setting up polling for active campaigns
    refetchInterval: (data) => {
      if (data?.status === 'sending') {
        return 30000; // Poll every 30 seconds
      }
      return false; // Don't poll for other statuses
    },
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation(campaignApi.createCampaign, {
    onSuccess: () => {
      // Invalidate and refetch the campaigns list after a new one is created
      queryClient.invalidateQueries(campaignKeys.lists());
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (variables: { id: number; data: Partial<Campaign> }) =>
      campaignApi.updateCampaign(variables.id, variables.data),
    {
      onSuccess: (data) => {
        // Invalidate both the list and the specific detail query
        queryClient.invalidateQueries(campaignKeys.lists());
        queryClient.setQueryData(campaignKeys.detail(data.id), data);
      },
    }
  );
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation(campaignApi.deleteCampaign, {
    onSuccess: () => {
      queryClient.invalidateQueries(campaignKeys.lists());
    },
    // Example of optimistic update (optional, but good for UX)
    // onMutate: async (deletedId) => {
    //   await queryClient.cancelQueries(campaignKeys.lists());
    //   const previousCampaigns = queryClient.getQueryData(campaignKeys.lists());
    //   // ... logic to remove the campaign from the cache ...
    //   return { previousCampaigns };
    // },
    // onError: (err, variables, context) => {
    //   if (context?.previousCampaigns) {
    //     queryClient.setQueryData(campaignKeys.lists(), context.previousCampaigns);
    //   }
    // },
    // onSettled: () => {
    //   queryClient.invalidateQueries(campaignKeys.lists());
    // },
  });
};

export const useLaunchCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation(campaignApi.launchCampaign, {
        onSuccess: (data) => {
            queryClient.invalidateQueries(campaignKeys.lists());
            queryClient.setQueryData(campaignKeys.detail(data.id), data);
        }
    })
};

export const usePauseCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation(campaignApi.pauseCampaign, {
        onSuccess: (data) => {
            queryClient.invalidateQueries(campaignKeys.lists());
            queryClient.setQueryData(campaignKeys.detail(data.id), data);
        }
    })
};

export const useResumeCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation(campaignApi.resumeCampaign, {
        onSuccess: (data) => {
            queryClient.invalidateQueries(campaignKeys.lists());
            queryClient.setQueryData(campaignKeys.detail(data.id), data);
        }
    })
};
