import { Suspense } from 'react';
import { BlogContent } from './blog-content';
import { Skeleton } from '@/components/ui/skeleton';

function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>
      {/* Category chips skeleton */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="w-full aspect-[16/9] rounded-lg" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Suspense fallback={<BlogLoading />}>
          <BlogContent />
        </Suspense>
      </main>
    </div>
  );
}
