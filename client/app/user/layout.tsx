'use client';

import { useUserContext } from '@/contexts/userContext';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const { setUser } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        router.push('/auth/login');
      }
    }
  }, [user, isLoading, setUser, router]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="loader"></div>
      </div>
    );

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col w-full h-full">{children}</div>
    </div>
  );
}
