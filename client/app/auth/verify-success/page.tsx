'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/language-provider';

export default function VerifySuccessPage() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/auth/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">App</h1>
          <p className="mt-2 text-muted-foreground">{t('verifySuccess')}</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>

            <p className="text-center text-muted-foreground">
              {t('verifySuccessDescription')}
            </p>

            <div className="mt-6 space-y-4">
              <Link href="/auth/login">
                <Button className="w-full">{t('login')}</Button>
              </Link>

              <p className="text-center text-sm text-muted-foreground">
                {t('ifNotRedirect')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
