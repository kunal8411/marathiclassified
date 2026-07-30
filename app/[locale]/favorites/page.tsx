import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/config/site";
import { FavoritesGrid } from "@/features/favorites/favorites-grid";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Favorites</h1>
      <FavoritesGrid locale={locale as Locale} />
    </div>
  );
}
