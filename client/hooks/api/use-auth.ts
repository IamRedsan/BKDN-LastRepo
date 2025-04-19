'use client';

import { useMutation } from '@tanstack/react-query';
import { client } from '@/shared/axiosClient';
import { AxiosError } from 'axios';
import { Role } from '@/enums/Role';

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      await client.post('/auth/logout');
    },
    mutationKey: ['logout'],
  });
};

interface LoginResponse {
  emailToken?: string;
  role?: Role;
  isBanned?: boolean;
  isEmailVerified?: boolean;
  isSuccess: boolean;
}

interface LoginRequeset {
  username: string;
  password: string;
}

export const useLogin = () => {
  return useMutation<LoginResponse, AxiosError, LoginRequeset>({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      const response = await client.post('/auth/login', { username, password }); // Replace authService.login
      return response.data;
    },
    mutationKey: ['login'],
  });
};

export const useResendEmailVerification = () => {
  return useMutation<{ message: string }, AxiosError, { emailToken: string }>({
    mutationFn: async ({ emailToken }) => {
      const response = await client.post('/auth/resend-email', { emailToken }); // Replace authService.resendEmailVerification
      return response.data;
    },
    mutationKey: ['resendEmailVerification'],
  });
};

interface RegisterResponse {
  emailToken?: string;
  isSuccess: boolean;
}

interface RegisterRequest {
  username: string;
  email: string;
  name: string;
  password: string;
  repassword: string;
}

export const useRegister = () => {
  return useMutation<RegisterResponse, AxiosError, RegisterRequest>({
    mutationFn: async ({ username, email, name, password, repassword }) => {
      const response = await client.post('/auth/register', {
        email,
        username,
        name,
        password,
        repassword,
      });
      return response.data;
    },
    mutationKey: ['register'],
  });
};
