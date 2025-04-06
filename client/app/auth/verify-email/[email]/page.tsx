'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/language-provider';
import { useParams } from 'next/navigation';
import { useResendEmailVerification } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
  const [countdown, setCountdown] = useState(10);
  const [canResend, setCanResend] = useState(false);
  const { email } = useParams();
  const emailToken = String(email);
  const { t } = useLanguage();
  const { mutate: resendEmail, isPending } = useResendEmailVerification();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResendEmail = async () => {
    setCanResend(false);
    setCountdown(10);
    resendEmail(
      { emailToken },
      {
        onSuccess: () => {
          toast({
            title: t('success'),
            description: t('resendEmailSuccess'),
          });
        },
        onError: () => {
          toast({
            title: t('error'),
            description: t('resendEmailFailed'),
          });
        },
      }
    );
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Appname</h1>
          <p className="mt-2 text-muted-foreground">Verify your email</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>

            <h2 className="text-center text-xl font-semibold">
              Check your email
            </h2>

            <p className="text-center text-muted-foreground">
              We've sent a verification link to your email address. Please check
              your inbox and click the link to verify your account.
            </p>

            <div className="mt-6 space-y-4">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full"
                disabled={!canResend || isPending}
              >
                {canResend
                  ? 'Resend verification email'
                  : `Resend in ${countdown} seconds`}
              </Button>

              <Link href="/auth/login">
                <Button className="w-full" disabled={isPending}>
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
