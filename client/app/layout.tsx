'use client';

import type React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import UserProvider from '@/contexts/userContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { LoadingProvider } from '@/contexts/loading-context';
import { LoadingOverlay } from '@/components/loading/loading-overlay';
import { Theme } from '@/enums/Theme';
import { Provider } from 'react-redux';
import store from '@/store';
import { NotificationProvider } from '@/contexts/notifContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme={Theme.System}
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <LoadingProvider>
                <LoadingOverlay />
                <UserProvider>
                  <NotificationProvider>
                    <Toaster />
                    <Provider store={store}>{children}</Provider>
                  </NotificationProvider>
                </UserProvider>
              </LoadingProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
