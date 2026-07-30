import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { type Locale } from "@/config/site";
import { connectDb } from "@/lib/db/connect";
import { toAdCard } from "@/lib/ads/to-ad-card";
import * as adService from "@/services/ad.service";
import * as categoryService from "@/services/category.service";
import { HomeHero } from "@/components/home/home-hero";
import { AdCard } from "@/components/ads/ad-card";
import { CategoryIconGrid } from "@/components/ads/category-icon-grid";
import { SafetyBanner } from "@/components/shared/safety-banner";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const loc = locale as Locale;
  const prefix = `/${loc}`;
  const isMarathi = loc === "mr";

  let featured: Awaited<ReturnType<typeof adService.featured>> = [];
  let latest: Awaited<ReturnType<typeof adService.listAds>>["items"] = [];
  let categories: Awaited<ReturnType<typeof categoryService.listCategories>> = [];

  try {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      throw new Error("skip db during build");
    }
    await connectDb();
    const [featuredRes, latestRes, cats] = await Promise.all([
      adService.featured(8),
      adService.listAds({ sort: "newest", limit: 12, status: "active" }),
      categoryService.listCategories(),
    ]);
    featured = featuredRes;
    latest = latestRes.items;
    categories = cats;
  } catch (error) {
    console.error("[home] data load failed", error);
  }

  const gridCategories = categories
    .filter((cat) => !cat.parentId)
    .slice(0, 12)
    .map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      href: `${prefix}/categories/${cat.slug}`,
    }));

  return (
    <>
      <HomeHero locale={loc} />
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 sm:py-12">
        {/* Categories Section */}
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("categories")}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {isMarathi ? "श्रेणीनुसार जाहिराती पहा" : "Browse listings by category"}
              </p>
            </div>
            <Link
              href={`${prefix}/search`}
              className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
            >
              {isMarathi ? "सर्व पहा" : "View all"} →
            </Link>
          </div>
          <CategoryIconGrid categories={gridCategories} locale={loc} />
        </section>

        {/* Featured Section */}
        {featured.length > 0 && (
          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t("featured")}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {isMarathi ? "सध्या लोकप्रिय जाहिराती" : "Popular listings trending now"}
                </p>
              </div>
              <Link
                href={`${prefix}/search?sort=popular`}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
              >
                {isMarathi ? "सर्व पहा" : "See all"} →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {featured.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={toAdCard(ad, loc)}
                  locale={loc === "mr" ? "mr-IN" : "en-IN"}
                />
              ))}
            </div>
          </section>
        )}

        {/* Latest Section */}
        {latest.length > 0 && (
          <section>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t("latest")}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {isMarathi ? "अलीकडे पोस्ट केलेल्या जाहिराती" : "Recently posted listings"}
                </p>
              </div>
              <Link
                href={`${prefix}/search`}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
              >
                {isMarathi ? "अधिक पहा" : "Browse more"} →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {latest.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={toAdCard(ad, loc)}
                  locale={loc === "mr" ? "mr-IN" : "en-IN"}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {featured.length === 0 && latest.length === 0 && (
          <section className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              {isMarathi ? "अजून कोणत्याही जाहिराती नाहीत" : "No listings yet"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {isMarathi
                ? "पहिली जाहिरात पोस्ट करा! लवकरच अधिक जाहिराती पहा."
                : "Be the first to post! Check back soon for more listings."}
            </p>
            <Link href={`${prefix}/sell`}>
              <button className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 transition-colors font-medium">
                {isMarathi ? "जाहिरात पोस्ट करा" : "Post an Ad"}
              </button>
            </Link>
          </section>
        )}

        <SafetyBanner title={t("safetyTitle")} message={t("safetyBody")} />
      </div>
    </>
  );
}
