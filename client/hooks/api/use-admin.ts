import { useQuery } from '@tanstack/react-query';
import { client } from '@/shared/axiosClient';
import { IUser } from '@/interfaces/user';
import { IThread } from '@/interfaces/thread';

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
