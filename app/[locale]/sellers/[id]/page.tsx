export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/config/site";
import { serverFetch } from "@/lib/api/server-fetch";
import { toAdCard } from "@/lib/ads/to-ad-card";
import type { SerializedAd } from "@/repositories/ad.repository";
import type { PublicProfile } from "@/services/user.service";
import { AdCard } from "@/components/ads/ad-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/shared/rating-stars";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function SellerPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const seller = await serverFetch<PublicProfile>(`/api/users/${id}`);
  if (!seller) notFound();

  const ads = await serverFetch<SerializedAd[]>(`/api/ads?sellerId=${id}&limit=24`);

  const initials = seller.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-20">
          <AvatarImage src={seller.image ?? undefined} alt={seller.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">{seller.name}</h1>
          {seller.location?.city ? (
            <p className="text-sm text-muted-foreground">{seller.location.city}</p>
          ) : null}
          <RatingStars value={seller.rating?.avg ?? 0} showValue />
          {seller.bio ? <p className="mt-2 max-w-xl text-sm text-muted-foreground">{seller.bio}</p> : null}
        </div>
      </div>
      <h2 className="mt-10 mb-6 text-xl font-semibold">Listings</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ads?.map((ad) => (
          <AdCard
            key={ad.id}
            ad={toAdCard(ad, loc)}
            locale={loc === "mr" ? "mr-IN" : "en-IN"}
          />
        ))}
      </div>
      {!ads?.length ? (
        <p className="text-sm text-muted-foreground">
          No active listings.{" "}
          <Link href={`/${loc}/search`} className="text-primary hover:underline">
            Browse marketplace
          </Link>
        </p>
      ) : null}
    </div>
  );
}
