import { useMutation, useQuery } from '@tanstack/react-query';
import { client } from '@/shared/axiosClient';
import { IUser } from '@/interfaces/user';
import { IThread } from '@/interfaces/thread';
import { queryClient } from '@/shared/queryClient';
import { AxiosError } from 'axios';

export const useAdminUsers = () => {
  return useQuery<IUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await client.get('/admin/users');
      return response.data;
    },
  });
};

export const useReportedThreads = (minReports: number = 1) => {
  return useQuery<IThread[]>({
    queryKey: ['reported-threads', minReports],
    queryFn: async () => {
      const response = await client.get(
        `/admin/threads/reported?minReports=${minReports}`
      );
      return response.data;
    },
  });
};

export const useAdminBanUser = () => {
  return useMutation<IUser, AxiosError, string>({
    mutationFn: async (userId: string) => {
      const response = await client.post(`/admin/users/ban/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-users'],
      });
    },
  });
};

export const useAdminBanThread = () => {
  return useMutation<IThread, AxiosError, string>({
    mutationFn: async (threadId: string) => {
      const response = await client.post(`/admin/threads/ban/${threadId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reported-threads'],
      });
    },
  });
};

export const useAdminApproveThread = () => {
  return useMutation<IThread, AxiosError, string>({
    mutationFn: async (threadId: string) => {
      const response = await client.post(`/admin/threads/approve/${threadId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reported-threads'],
      });
    },
  });
};
