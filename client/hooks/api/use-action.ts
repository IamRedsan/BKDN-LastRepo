import { useUserContext } from "@/contexts/userContext";
import { client } from "@/shared/axiosClient";
import { queryClient } from "@/shared/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

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
        queryKey: ["userProfile", username],
      });
      queryClient.invalidateQueries({
        queryKey: ["userProfile", user!.username],
      });
    },
    onError: (error) => {
      console.error("Failed to follow/unfollow user:", error);
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
        queryKey: ["userProfile", username],
      });
      queryClient.invalidateQueries({
        queryKey: ["userProfile", user!.username],
      });
    },
    onError: (error: any) => {},
  });
};
