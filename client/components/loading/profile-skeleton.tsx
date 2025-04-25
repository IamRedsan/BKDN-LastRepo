import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="relative">
        <Skeleton className="h-48 w-full rounded-lg" />

        <div className="absolute -bottom-16 left-4">
          <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
        </div>

        <div className="absolute right-4 top-4 flex space-x-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>

      <div className="mt-20 space-y-4">
        <div className="mt-16">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="mt-2 h-4 w-[150px]" />
        </div>

        <Skeleton className="h-16 w-full" />

        <Skeleton className="h-4 w-[180px]" />

        <div className="flex space-x-4">
          <Skeleton className="h-6 w-[100px]" />
          <Skeleton className="h-6 w-[100px]" />
        </div>

        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
