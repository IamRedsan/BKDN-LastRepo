import { useUserContext } from "@/contexts/userContext";
import { Language } from "@/enums/Language";
import { Theme } from "@/enums/Theme";
import { IThread } from "@/interfaces/thread";
import { IUser } from "@/interfaces/user";
import { client } from "@/shared/axiosClient";
import { queryClient } from "@/shared/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useUpdateUser = () => {
  const { user } = useUserContext();
  return useMutation({
    mutationFn: async (userData: Partial<IUser>) => {
      const response = await client.put("/user", userData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", user!.username],
      });
    },
  });
};

export const useUpdateUserAvatar = () => {
  const { user } = useUserContext();
  return useMutation<IUser, AxiosError, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await client.patch("/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", user!.username],
      });
    },
  });
};

export const useUpdateWallpaper = () => {
  const { user } = useUserContext();
  return useMutation<IUser, AxiosError, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await client.patch("/user/wallpaper", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", user!.username],
      });
    },
  });
};

interface UpdateUserInfoRequest {
  name: string;
  username: string;
  bio?: string;
}

export const useUpdateUserInfo = () => {
  return useMutation<IUser, AxiosError, UpdateUserInfoRequest>({
    mutationFn: async (userData: UpdateUserInfoRequest) => {
      const response = await client.patch("/user/info", userData);
      return response.data;
    },
  });
};

interface UpdateUserSettingRequest {
  language: Language;
  theme: Theme;
}

export const useUpdateUserSetting = () => {
  return useMutation<IUser, AxiosError, UpdateUserSettingRequest>({
    mutationFn: async (userData: UpdateUserSettingRequest) => {
      const response = await client.patch("/user/setting", userData);
      return response.data;
    },
  });
};

interface UpdateUserPasswordRequest {
  oldPassword: string;
  newPassword: string;
  rePassword: string;
}

export const useUpdateUserPassword = () => {
  return useMutation<boolean, AxiosError, UpdateUserPasswordRequest>({
    mutationFn: async (passwordData: UpdateUserPasswordRequest) => {
      const response = await client.patch("/user/password", passwordData);
      return response.data;
    },
  });
};

interface ProfileResponse {
  user: IUser;
  threads: IThread[];
  reThreads: IThread[];
}

export const useGetProfile = (username: string) => {
  return useQuery<ProfileResponse, AxiosError>({
    queryKey: ["userProfile", username], // Dùng key độc nhất cho query
    queryFn: async () => {
      const response = await client.get(`/profile/${username}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 1, // Thời gian dữ liệu được coi là mới
  });
};
