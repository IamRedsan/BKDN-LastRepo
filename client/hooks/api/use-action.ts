import { useUserContext } from '@/contexts/userContext';
import { IThread } from '@/interfaces/thread';
import { client } from '@/shared/axiosClient';
import { queryClient } from '@/shared/queryClient';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

interface FollowTriggerResponse {
  following: {
    username: string;
    name: string;
    avatar: string;
  }[];
  followingCount: number;
}

export const useFollowTrigger = () => {
  const { user } = useUserContext();
  return useMutation<FollowTriggerResponse, AxiosError, string>({
    mutationFn: async (username: string) => {
      const response = await client.post(`/action/follow/${username}`);
      return response.data;
    },
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({
        queryKey: ['userProfile', username],
      });
      queryClient.invalidateQueries({
        queryKey: ['userProfile', user!.username],
      });
    },
    onError: (error) => {
      console.error('Failed to follow/unfollow user:', error);
    },
  });
};

interface UnfollowFollowersResponse {
  followers: {
    username: string;
    name: string;
    avatar: string;
  }[];
  followersCount: number;
}
export const useRemoveFollower = () => {
  const { user } = useUserContext();
  return useMutation<UnfollowFollowersResponse, AxiosError, string>({
    mutationFn: async (username: string) => {
      const response = await client.post(`/action/unfollow/${username}`);
      return response.data;
    },
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({
        queryKey: ['userProfile', username],
      });
      queryClient.invalidateQueries({
        queryKey: ['userProfile', user!.username],
      });
    },
    onError: (error: any) => {},
  });
};

export const useLikeThread = () => {
  return useMutation<IThread, AxiosError, string>({
    mutationFn: async (threadId: string) => {
      const response = await client.post(`/action/like/${threadId}`);
      return response.data;
    },
    onSuccess: (_, threadId) => {
      // Invalidate thread data to refresh UI
      queryClient.invalidateQueries({
        queryKey: ['threadDetail', threadId],
      });
    },
    onError: (error) => {
      console.error('Failed to like/unlike thread:', error);
    },
  });
};

export const useRethread = () => {
  return useMutation<IThread, AxiosError, string>({
    mutationFn: async (threadId: string) => {
      const response = await client.post(`/action/rethread/${threadId}`);
      return response.data;
    },
    onSuccess: (_, threadId) => {
      queryClient.invalidateQueries({
        queryKey: ['threadDetail', threadId],
      });
    },
    onError: (error) => {
      console.error('Failed to rethread/unrethread thread:', error);
    },
  });
};
