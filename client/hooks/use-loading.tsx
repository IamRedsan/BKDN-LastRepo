'use client';

import { useLoading as useLoadingContext } from '@/contexts/loading-context';
import { useCallback } from 'react';

export function useLoading() {
  const {
    isLoading,
    setLoading,
    loadingType,
    setLoadingType,
    loadingMessage,
    setLoadingMessage,
  } = useLoadingContext();

  // Helper function to show loading with a message
  const showLoading = useCallback(
    (message?: string, type: 'spinner' | 'skeleton' = 'spinner') => {
      setLoadingType(type);
      if (message) setLoadingMessage(message);
      setLoading(true);
    },
    [setLoading, setLoadingMessage, setLoadingType]
  );

  // Helper function to hide loading
  const hideLoading = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  // Helper function to wrap an async function with loading state
  const withLoading = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      options?: {
        message?: string;
        type?: 'spinner' | 'skeleton';
      }
    ): Promise<T> => {
      try {
        showLoading(options?.message, options?.type);
        return await fn();
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  return {
    isLoading,
    showLoading,
    hideLoading,
    withLoading,
    loadingType,
    loadingMessage,
  };
}
