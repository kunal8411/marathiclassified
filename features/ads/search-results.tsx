"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";

import type { Locale } from "@/config/site";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAds, useSearchAds } from "@/hooks/use-ads";
import { toAdCard } from "@/lib/ads/to-ad-card";
import { AdCard } from "@/components/ads/ad-card";
import { AdFilters, type AdFiltersValue } from "@/components/ads/ad-filters";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";

type SearchResultsProps = {
  locale: Locale;
};

export function SearchResults({ locale }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const [filters, setFilters] = React.useState<AdFiltersValue>({
    sort: "newest",
  });

  const debouncedFilters = useDebouncedValue(filters, 400);

  const hasQuery = q.trim().length > 0;

  const listQuery = useAds(
    {
      ...debouncedFilters,
      limit: 24,
    },
    { enabled: !hasQuery },
  );

  const searchQuery = useSearchAds(q, {
    ...debouncedFilters,
    limit: 24,
  });

  const active = hasQuery ? searchQuery : listQuery;

  if (active.isLoading) {
    return <LoadingState variant="skeleton-grid" label="Searching…" />;
  }

  if (active.isError) {
    return <ErrorState message="Could not load listings" onRetry={() => active.refetch()} />;
  }

  const items = active.data?.items ?? [];

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <AdFilters value={filters} onChange={setFilters} />
      <div className="min-w-0 flex-1">
        <p className="mb-4 text-sm text-muted-foreground">
          {items.length} result{items.length === 1 ? "" : "s"}
          {q ? ` for “${q}”` : ""}
        </p>
        {items.length === 0 ? (
          <EmptyState title="No listings found" description="Try different filters or keywords." />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {items.map((ad) => (
              <AdCard
                key={ad.id}
                ad={toAdCard(ad, locale)}
                locale={locale === "mr" ? "mr-IN" : "en-IN"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
