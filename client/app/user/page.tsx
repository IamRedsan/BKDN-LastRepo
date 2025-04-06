'use client';

import MainLayout from '@/components/layouts/main-layout';
import FeedPage from '@/components/feed/feed-page';

export default function Home() {
  return (
    <MainLayout>
      <FeedPage />
    </MainLayout>
  );
}
