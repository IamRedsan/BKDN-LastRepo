'use client';

import { useLanguage } from '@/components/language-provider';
import MainLayout from '@/components/layouts/main-layout';
import { useUserContext } from '@/contexts/userContext';
import { useLoading } from '@/hooks/use-loading';
import { useEffect } from 'react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { whoami, user, isLoading } = useUserContext();
  const { withLoading } = useLoading();
  const { t } = useLanguage();
  useEffect(() => {
    if (!user) {
      withLoading(
        async () => {
          await whoami();
        },
        {
          message: t('loading'),
          type: 'spinner',
        }
      );
    }
  }, [user]);

  if (isLoading || !user)
    return (
      <div className="flex items-center justify-center w-full h-full">
        {/* <div className="loader"></div> */}
      </div>
    );

  return (
    <div className="flex flex-col w-full h-full">
      <MainLayout>{children}</MainLayout>
    </div>
  );
}
