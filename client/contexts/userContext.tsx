import { useLanguage } from '@/components/language-provider';
import { useTheme } from '@/components/theme-provider';
import { Language } from '@/enums/Language';
import { Theme } from '@/enums/Theme';
import { createContext, useContext, useEffect, useState } from 'react';

interface IUser {
  name: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  banner: string;
  bio: string;
  followers: number;
  following: number;
  role: Role;
  setting: {
    theme: Theme;
    language: Language;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type UserContextType = {
  user?: IUser;
  setUser: (user: IUser) => void;
  removeUser: () => void;
  // isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

export const UserContext = createContext<UserContextType | null>(null);

const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<IUser | undefined>(undefined);
  const { setLanguage } = useLanguage();
  const { setTheme } = useTheme();
  // const { data, loading, error } = useQuery(GET_USER);

  // useEffect(() => {
  //   if (!loading) {
  //     if (data?.whoami) {
  //       setUserState(data.whoami);
  //     } else if (error) {
  //       setUserState(undefined);
  //     }
  //   }
  // }, [data, loading, error]);

  const setUser = (user: IUser) => {
    setUserState(user);
  };

  const removeUser = () => {
    setUserState(undefined);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        removeUser,
        // isLoading: loading,
        setIsLoading: () => {},
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext) as UserContextType;
};

export default UserProvider;
