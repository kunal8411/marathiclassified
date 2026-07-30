export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/config/site";
import { connectDb } from "@/lib/db/connect";
import { getLocalizedName } from "@/lib/i18n";
import { toAdCard } from "@/lib/ads/to-ad-card";
import * as categoryService from "@/services/category.service";
import * as adService from "@/services/ad.service";
import { AdCard } from "@/components/ads/ad-card";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const prefix = `/${loc}`;

  await connectDb();
  const category = await categoryService.getBySlug(slug);
  if (!category) notFound();

  const all = await categoryService.listCategories();
  const children = all.filter((c) => String(c.parentId ?? "") === category.id);

  const adsResult = await adService.listAds({
    categoryId: category.id,
    limit: 24,
    status: "active",
  });

  // Also include ads from child categories when viewing a parent
  let ads = adsResult.items;
  if (children.length) {
    const childAds = await Promise.all(
      children.map((child) =>
        adService.listAds({ categoryId: child.id, limit: 24, status: "active" }),
      ),
    );
    const merged = [...ads, ...childAds.flatMap((r) => r.items)];
    const seen = new Set<string>();
    ads = merged.filter((ad) => {
      if (seen.has(ad.id)) return false;
      seen.add(ad.id);
      return true;
    });
  }

  const title = getLocalizedName(category.name, loc);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{ads.length} listings</p>

      {children.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`${prefix}/categories/${child.slug}`}
              className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-primary/40"
            >
              {getLocalizedName(child.name, loc)}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ads.map((ad) => (
          <AdCard
            key={ad.id}
            ad={toAdCard(ad, loc)}
            locale={loc === "mr" ? "mr-IN" : "en-IN"}
          />
        ))}
      </div>
    </div>
  );
}
