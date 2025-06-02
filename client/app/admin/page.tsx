'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Flag } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export default function AdminDashboard() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">{t('dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('userManagement')}
            </CardTitle>
            <CardDescription>{t('manageUsersDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{t('accessUserList')}</p>
            <Link href="/admin/users">
              <Button>{t('manageUsers')}</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              {t('reportedPosts')}
            </CardTitle>
            <CardDescription>{t('reviewReportedContent')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{t('viewReportedPostsDescription')}</p>
            <Link href="/admin/reports">
              <Button>{t('manageReports')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
