'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useLoading } from '@/contexts/loading-context';

export function LoadingSkeleton() {
  const { loadingMessage } = useLoading();

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>

      <Skeleton className="h-24 w-full" />

      <div className="flex space-x-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>

      {loadingMessage && (
        <p className="text-center text-muted-foreground">{loadingMessage}</p>
      )}
    </div>
  );
}
