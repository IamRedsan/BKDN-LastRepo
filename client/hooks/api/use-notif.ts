import { useMutation, useQuery } from "@tanstack/react-query";
import { client } from "@/shared/axiosClient";
import { AxiosError } from "axios";

export const useMarkNotificationAsRead = () => {
  return useMutation<void, AxiosError, string>({
    mutationFn: async (id: string) => {
      await client.post(`/notification/${id}`);
    },
  });
};

export const useMarkNotificationsAsRead = () => {
  return useMutation<void, AxiosError, string[]>({
    mutationFn: async (data: string[]) => {
      await client.post("/notification", data);
    },
  });
};
