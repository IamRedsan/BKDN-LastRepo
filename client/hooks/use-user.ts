import { IUser } from '@/interfaces/user';
import { client } from '@/shared/axiosClient';
import { queryClient } from '@/shared/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<IUser>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await client.get('/user/whoami');
      return response.data;
    },
  });

  return {
    user,
    isLoading,
    isError,
    error,
  };
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (userData: Partial<IUser>) => {
      const response = await client.put('/user', userData); // Replace authService.updateUser
      return response.data;
    },
    mutationKey: ['updateUser'],
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
    },
  });
};
