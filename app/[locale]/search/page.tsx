import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/config/site";
import { SearchResults } from "@/features/ads/search-results";
import { LoadingState } from "@/components/shared/loading-state";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Search listings</h1>
      <Suspense fallback={<LoadingState variant="skeleton-grid" label="Loading…" />}>
        <SearchResults locale={locale as Locale} />
      </Suspense>
    </div>
  );
}
