"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface AdCardSkeletonProps {
  count?: number;
}

export function AdCardSkeleton({ count = 4 }: AdCardSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-0">
          <CardContent className="p-0">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-5 w-1/3 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface CategorySkeletonProps {
  count?: number;
}

export function CategoryGridSkeleton({ count = 8 }: CategorySkeletonProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Skeleton className="h-12 w-12 rounded-full sm:h-16 sm:w-16" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

interface HeroSkeletonProps {
  locale?: string;
}

interface HeroSkeletonProps {
  locale?: string;
}

export function HeroSkeleton() {
  return (
    <div className="relative bg-gradient-to-b from-gray-900/50 to-transparent px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center space-y-4">
        <Skeleton className="mx-auto h-8 w-48 rounded" />
        <Skeleton className="mx-auto h-12 w-64 rounded" />
        <Skeleton className="mx-auto h-4 w-72 rounded" />
        <div className="flex gap-2 justify-center">
          <Skeleton className="h-10 w-32 rounded" />
          <Skeleton className="h-10 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}
