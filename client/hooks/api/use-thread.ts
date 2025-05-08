import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { client } from "@/shared/axiosClient";
import { IThread } from "@/interfaces/thread";
import { Visibility } from "@/enums/ThreadEnum";
import { queryClient } from "@/shared/queryClient";
import { useUserContext } from "@/contexts/userContext";

interface ThreadResponse {
  parentThread: IThread | null;
  mainThread: IThread;
  comments: IThread[];
}

export const useGetThreadDetail = (threadId: string) => {
  return useQuery<ThreadResponse, AxiosError>({
    queryKey: ["threadDetail", threadId], // Unique query key
    queryFn: async () => {
      const response = await client.get(`/thread/detail/${threadId}`);
      return response.data;
    },
    enabled: !!threadId, // Only fetch if threadId exists
    staleTime: 0,
  });
};

interface ThreadCreateUpdateRequest {
  threadId?: string;
  parentThreadId?: string | null;
  content: string;
  visibility: Visibility;
  media: File[];
  oldMedia?: string[];
}

export const useCreateThread = () => {
  const { user } = useUserContext();
  return useMutation<IThread, AxiosError, ThreadCreateUpdateRequest>({
    mutationFn: async (payload: ThreadCreateUpdateRequest) => {
      const formData = new FormData();
      formData.append("content", payload.content);
      formData.append("visibility", payload.visibility);
      if (payload.parentThreadId) {
        formData.append("parentThreadId", payload.parentThreadId);
      }
      if (payload.media) {
        payload.media.forEach((file) => formData.append("media", file));
      }

      const response = await client.post("/thread", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (variables.parentThreadId) {
        queryClient.invalidateQueries({
          queryKey: ["threadDetail", variables.parentThreadId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["threadDetail", variables.threadId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userProfile", user!.username],
      });
    },
  });
};

export const useUpdateThread = () => {
  const { user } = useUserContext();
  return useMutation<IThread, AxiosError, ThreadCreateUpdateRequest>({
    mutationFn: async (payload: ThreadCreateUpdateRequest) => {
      const formData = new FormData();
      formData.append("threadId", payload.threadId!);
      formData.append("content", payload.content);
      formData.append("visibility", payload.visibility);
      if (payload.parentThreadId) {
        formData.append("parentThreadId", payload.parentThreadId);
      }
      if (payload.oldMedia) {
        formData.append("oldMedia", JSON.stringify(payload.oldMedia));
      }
      if (payload.media) {
        payload.media.forEach((file) => formData.append("media", file));
      }

      const response = await client.put("/thread", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (thread, variables) => {
      if (thread.parentThreadId) {
        queryClient.invalidateQueries({
          queryKey: ["threadDetail", variables.parentThreadId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["threadDetail", variables.threadId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userProfile", user!.username],
      });
    },
  });
};

export const useDeleteThread = () => {
  const { user } = useUserContext();
  return useMutation<IThread, AxiosError, string>({
    mutationFn: async (threadId: string) => {
      const response = await client.delete(`/thread/${threadId}`);
      return response.data;
    },
    onSuccess: (_, threadId) => {
      queryClient.invalidateQueries({
        queryKey: ["threadDetail", threadId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userProfile", user!.username],
      });
    },
  });
};

export const useGetFeedThreads = () => {
  return useInfiniteQuery<IThread[], AxiosError>({
    queryKey: ["feedThreads"],
    queryFn: async ({ pageParam }) => {
      const response = await client.get(`/thread/feed`, {
        params: { lastCreatedAt: pageParam || null }, // Pass `null` if `pageParam` doesn't exist
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      // Get `createdAt` of the last post in the current page
      return lastPage?.length > 0
        ? lastPage[lastPage.length - 1].createdAt
        : undefined;
    },
    initialPageParam: null, // Set the initial page parameter
    staleTime: 0, // 1 minute
  });
};
