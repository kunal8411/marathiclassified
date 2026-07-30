import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
  label?: string;
  variant?: "spinner" | "skeleton-grid";
  className?: string;
  count?: number;
};

export function LoadingState({
  label = "Loading…",
  variant = "spinner",
  className,
  count = 6,
}: LoadingStateProps) {
  if (variant === "skeleton-grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4",
          className,
        )}
        aria-busy="true"
        aria-label={label}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
