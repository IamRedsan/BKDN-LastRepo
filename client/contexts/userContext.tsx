'use client';
import { createContext, useContext, useState } from 'react';
import { IUser } from '@/interfaces/user';
import { queryClient } from '@/shared/queryClient';
import { client } from '@/shared/axiosClient';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { useLanguage } from '@/components/language-provider';
import { Theme } from '@/enums/Theme';
import { Language } from '@/enums/Language';

export type UserContextType = {
  user: IUser | null;
  isLoading: boolean;
  whoami: () => Promise<void>;
  setUser: (user: IUser | null) => void;
  removeUser: () => void;
};

export const UserContext = createContext<UserContextType | null>(null);

const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setIUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();
  const router = useRouter();

  const setUser = (user: IUser | null) => {
    setIUser(user);
    setTheme(user?.theme ?? Theme.System);
    setLanguage(user?.language ?? Language.English);
  };

  const whoami = async () => {
    try {
      setIsLoading(true);
      const response = await client.get('/user/whoami');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      router.push('/auth/login');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = () => {
    setUser(null);
    queryClient.setQueryData(['user'], null);
  };

  const value = {
    user,
    isLoading,
    whoami,
    setUser,
    removeUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export default UserProvider;
