'use client';

import { useLoading } from '@/contexts/loading-context';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LoadingSkeleton } from '@/components/loading/loading-skeleton';

export function LoadingOverlay() {
  const { isLoading, loadingType, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-card p-6 shadow-lg">
        {loadingType === 'spinner' ? (
          <LoadingSpinner size="lg" />
        ) : (
          <LoadingSkeleton />
        )}

        {loadingMessage && (
          <p className="text-center text-muted-foreground">{loadingMessage}</p>
        )}
      </div>
    </div>
  );
}
