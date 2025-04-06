'use client';
import { createContext, useContext, useState } from 'react';
import { IUser } from '@/interfaces/user';
import { queryClient } from '@/shared/queryClient';

export type UserContextType = {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  removeUser: () => void;
};

export const UserContext = createContext<UserContextType | null>(null);

const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);

  const removeUser = () => {
    setUser(null);
    queryClient.setQueryData(['user'], null);
  };

  const value = {
    user,
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
