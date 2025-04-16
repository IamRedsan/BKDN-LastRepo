'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingType: 'spinner' | 'skeleton';
  setLoadingType: (type: 'spinner' | 'skeleton') => void;
  loadingMessage: string | null;
  setLoadingMessage: (message: string | null) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'spinner' | 'skeleton'>(
    'spinner'
  );
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (!loading) {
      setLoadingMessage(null);
    }
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setLoading,
        loadingType,
        setLoadingType,
        loadingMessage,
        setLoadingMessage,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
