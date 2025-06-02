'use client';
import { useLanguage } from '@/components/language-provider';

// app/admin/reports/loading.tsx
export default function Loading() {
  const { t } = useLanguage();
  return <div>{t('loading')}</div>;
}
