import axios from 'axios';
import { useRouter } from 'next/router';

export const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;

if (!baseURL) {
  throw new Error(
    'NEXT_PUBLIC_SERVER_URL is not defined in environment variables'
  );
}

export const client = axios.create({
  baseURL: `${baseURL}`,
  withCredentials: true,
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Let backend handle refresh token
        await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Retry the original request
        return client(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle as needed
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
