import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAuditLogs,
  getHealthStatus,
  ActivityLog,
  HealthStatus,
} from '../services/adminApi';
import { User } from '../services/authService';
import toast from 'react-hot-toast';

const USERS_QUERY_KEY = 'users';
const AUDIT_LOGS_QUERY_KEY = 'auditLogs';
const HEALTH_STATUS_QUERY_KEY = 'healthStatus';

export const useUsers = () => {
  return useQuery<User[], Error>(USERS_QUERY_KEY, getUsers);
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(USERS_QUERY_KEY);
      toast.success('User created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation(updateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(USERS_QUERY_KEY);
      toast.success('User updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(USERS_QUERY_KEY);
      toast.success('User deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });
};

export const useAuditLogs = () => {
  return useQuery<ActivityLog[], Error>(AUDIT_LOGS_QUERY_KEY, getAuditLogs);
};

export const useHealthStatus = () => {
  return useQuery<HealthStatus, Error>(HEALTH_STATUS_QUERY_KEY, getHealthStatus, {
    refetchInterval: 30000, // Poll every 30 seconds
  });
};
