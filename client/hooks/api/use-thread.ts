import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { client } from "@/shared/axiosClient";
import { IThread } from "@/interfaces/thread";
import { Visibility } from "@/enums/ThreadEnum";
import { queryClient } from "@/shared/queryClient";

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
  });
};

interface ThreadCreateUpdateRequest {
  threadId?: string;
  parentThreadId?: string | null;
  content: string;
  visibility: Visibility;
  media: File[];
}

export const useCreateThread = () => {
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
    },
  });
};

export const useUpdateThread = () => {
  return useMutation<IThread, AxiosError, ThreadCreateUpdateRequest>({
    mutationFn: async (payload: ThreadCreateUpdateRequest) => {
      const formData = new FormData();
      formData.append("threadID", payload.threadId!);
      formData.append("content", payload.content);
      formData.append("visibility", payload.visibility);
      if (payload.parentThreadId) {
        formData.append("parentThreadId", payload.parentThreadId);
      }
      if (payload.media) {
        payload.media.forEach((file) => formData.append("media", file));
      }

      const response = await client.patch("/thread/update", formData, {
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
    },
  });
};
