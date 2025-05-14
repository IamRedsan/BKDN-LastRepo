'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { Users, Flag, Home, Settings } from 'lucide-react';
import { LogoutButton } from '@/components/logout-button';
import { useLanguage } from '@/components/language-provider';
import { useUserContext } from '@/contexts/userContext';
import { useLoading } from '@/hooks/use-loading';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const { whoami, user, isLoading, amiAdmin } = useUserContext();
  const { withLoading } = useLoading();
  const router = useRouter();

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
    if (user && !amiAdmin()) {
      router.push('/user');
    }
  }, [user]);

  if (isLoading || !user)
    return (
      <div className="flex items-center justify-center w-full h-full">
        {/* <div className="loader"></div> */}
      </div>
    );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="bg-muted w-64 p-4 flex flex-col fixed h-full">
        <div className="text-xl font-bold mb-6">{t('adminPanel')}</div>
        <nav className="space-y-2 flex-1">
          <Link
            href="/admin"
            className="flex items-center gap-2 p-2 rounded hover:bg-muted-foreground"
          >
            <Home className="h-5 w-5" />
            <span>{t('dashboard')}</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 p-2 rounded hover:bg-muted-foreground"
          >
            <Users className="h-5 w-5" />
            <span>{t('users')}</span>
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 p-2 rounded hover:bg-muted-foreground"
          >
            <Flag className="h-5 w-5" />
            <span>{t('reportedPosts')}</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 p-2 rounded hover:bg-muted-foreground"
          >
            <Settings className="h-5 w-5" />
            <span>{t('settings')}</span>
          </Link>
        </nav>

        {/* Logout button at bottom of sidebar */}
        <div className="mt-auto pt-4 border-t bg-muted">
          <LogoutButton
            variant="ghost"
            className="w-full justify-start hover:bg-muted-foreground"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-64 p-4">{children}</div>
    </div>
  );
}
