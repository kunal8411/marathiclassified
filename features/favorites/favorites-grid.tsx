"use client";

import type { Locale } from "@/config/site";
import { useFavoriteAds } from "@/hooks/use-favorites";
import { toAdCard } from "@/lib/ads/to-ad-card";
import { AdCard } from "@/components/ads/ad-card";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";

type FavoritesGridProps = {
  locale: Locale;
};

export function FavoritesGrid({ locale }: FavoritesGridProps) {
  const { data, isLoading } = useFavoriteAds();

  if (isLoading) return <LoadingState variant="skeleton-grid" />;
  if (!data?.length) {
    return <EmptyState title="No favorites yet" description="Save listings you like from the ad page." />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {data.map((ad) => (
        <AdCard
          key={ad.id}
          ad={toAdCard(ad, locale)}
          locale={locale === "mr" ? "mr-IN" : "en-IN"}
        />
      ))}
    </div>
  );
}
