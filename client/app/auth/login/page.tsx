'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/components/language-provider';
import { useLogin } from '@/hooks/api/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/enums/Role';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { mutate: login, isPending } = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === '' || password === '') {
      toast({
        title: t('error'),
        description: t('emptyFields'),
      });
      return;
    }
    login(
      { username, password },
      {
        onSuccess: (data) => {
          if (data.isEmailVerified === false) {
            router.push('/auth/verify-email/' + data.emailToken!);
            return;
          }
          if (data.isSuccess === false) {
            toast({
              title: t('error'),
              description: t('loginFailed'),
            });
            return;
          }
          if (data.isBanned) {
            toast({
              title: t('error'),
              description: t('banned'),
            });
            return;
          }
          if (data.role === Role.ADMIN) {
            router.push('/admin');
          } else {
            router.push('/user');
          }
        },
        onError: (error) => {
          console.error('Login failed:', error);
        },
      }
    );
  };

  const handleGoogleLogin = () => {
    const popup = window.open(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google`,
      'GoogleAuth',
      'width=500,height=600'
    );

    window.addEventListener('message', (event) => {
      if (event.origin !== process.env.NEXT_PUBLIC_SERVER_URL) {
        console.error('Invalid origin:', event.origin);
        return;
      }

      if (event.data.success) {
        if (event.data.role === Role.ADMIN) {
          router.push('/admin');
          toast({
            title: t('success'),
            description: t('googleLoginSuccess'),
          });
        } else {
          router.push('/user');
          toast({
            title: t('success'),
            description: t('googleLoginSuccess'),
          });
        }
      } else {
        toast({
          title: t('error'),
          description: t('googleLoginFailed'),
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">LOGIN</h1>
          <p className="mt-2 text-muted-foreground">{t('login')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('username')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder={t('username')}
                  className="pl-10"
                  value={username}
                  disabled={isPending}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="pl-10 pr-10"
                  value={password}
                  placeholder="********"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t('loading') : t('login')}
          </Button>

          <Separator className="my-4" />

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              {t('google')}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('register')}?{' '}
            <Link
              href="/auth/register"
              className="text-primary hover:underline"
            >
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
