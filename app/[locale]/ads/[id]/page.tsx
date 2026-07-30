import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import type { Locale } from "@/config/site";
import { connectDb } from "@/lib/db/connect";
import { toAdCard } from "@/lib/ads/to-ad-card";
import * as adService from "@/services/ad.service";
import * as userService from "@/services/user.service";
import { getSessionUser } from "@/lib/auth/session";
import { AdGallery } from "@/components/ads/ad-gallery";
import { AdCard } from "@/components/ads/ad-card";
import { SellerDetails } from "@/components/ads/seller-details";
import { ChatThread } from "@/components/ads/chat-thread";
import { PriceTag } from "@/components/shared/price-tag";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const isMarathi = loc === "mr";

  if (process.env.NEXT_PHASE === "phase-production-build") {
    notFound();
  }

  await connectDb();

  let ad;
  try {
    ad = await adService.getAd(id, true);
  } catch {
    notFound();
  }
  if (!ad) notFound();

  const seller = await userService
    .getPublicProfile(String(ad.sellerId))
    .catch(() => null);
  const currentUser = await getSessionUser().catch(() => null);
  const relatedResult = await adService.listAds({
    categoryId: String(ad.categoryId),
    limit: 8,
    status: "active",
  });
  const relatedCards = relatedResult.items
    .filter((r) => r.id !== ad.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Breadcrumb & Title */}
        <div className="mb-6 space-y-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {isMarathi ? "मुख्यपृष्ठ" : "Home"} /{" "}
            <span className="text-slate-900 dark:text-slate-100">
              {ad.title}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{ad.title}</h1>
              <div className="mt-2 flex flex-wrap gap-3">
                {ad.condition && (
                  <Badge variant="secondary">
                    {isMarathi
                      ? ad.condition === "new"
                        ? "नवीन"
                        : "वापरलेले"
                      : ad.condition === "new"
                        ? "New"
                        : "Used"}
                  </Badge>
                )}
                {ad.location?.city && (
                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                    {ad.location.city}
                  </div>
                )}
                {ad.createdAt && (
                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    {new Date(ad.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <PriceTag
                amount={ad.price}
                locale={loc === "mr" ? "mr-IN" : "en-IN"}
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left: Gallery & Details */}
          <div className="space-y-8">
            {/* Gallery */}
            <div className="rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
              <AdGallery
                images={
                  (ad.images ?? []) as unknown as import("@/types").AdImage[]
                }
                alt={ad.title}
              />
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {isMarathi ? "वर्णन" : "Description"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {ad.description}
                </p>
              </CardContent>
            </Card>

            {/* Specifications */}
            {ad.attributes && Object.keys(ad.attributes).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isMarathi ? "वैशिष्ट्ये" : "Specifications"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-4">
                    {Object.entries(ad.attributes).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {key}
                        </dt>
                        <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* Related Ads */}
            {relatedCards.length > 0 && (
              <section>
                <h2 className="mb-4 text-2xl font-bold">
                  {isMarathi
                    ? "समान जाहिराती"
                    : "Similar listings"}
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {relatedCards.map((item) => (
                    <AdCard
                      key={item.id}
                      ad={toAdCard(item, loc)}
                      locale={loc === "mr" ? "mr-IN" : "en-IN"}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: Seller & Chat */}
          <div className="space-y-4">
            {/* Seller Card */}
            {seller && (
            <SellerDetails
              seller={{
                id: seller.id,
                name: seller.name,
                image: seller.image || undefined,
                memberSince: seller.createdAt,
                city: seller.location?.city || undefined,
                rating: seller.rating?.avg,
                ratingCount: seller.rating?.count,
              }}
                adId={ad.id}
                locale={loc}
              />
            )}

            {/* Chat Thread */}
            {currentUser && seller && (
              <Suspense fallback={<div>Loading chat...</div>}>
                <ChatThread
                  locale={loc}
                  currentUserId={currentUser.id}
                  sellerId={seller.id}
                  sellerName={seller.name}
                  sellerImage={seller.image || undefined}
                  adId={ad.id}
                />
              </Suspense>
            )}

            {/* Ad Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isMarathi ? "जाहिरात माहिती" : "Ad Info"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    {isMarathi ? "ID" : "ID"}
                  </span>
                  <span className="font-mono text-xs text-slate-900 dark:text-slate-100">
                    {ad.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    {isMarathi ? "दृश्ये" : "Views"}
                  </span>
                  <span className="font-semibold">{ad.views || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    {isMarathi ? "पोस्ट केले" : "Posted"}
                  </span>
                  <span>
                    {ad.createdAt
                      ? new Date(ad.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
