import type { AdCardData } from "@/components/ads/ad-card";
import type { AdImage } from "@/types";
import type { SerializedAd } from "@/repositories/ad.repository";

export function toAdCard(ad: SerializedAd, locale: string): AdCardData {
  const images = (ad.images ?? []) as unknown as AdImage[];
  return {
    id: ad.id,
    title: ad.title,
    price: ad.price,
    href: `/${locale}/ads/${ad.id}`,
    images,
    city: ad.location?.city ?? undefined,
    area: ad.location?.area ?? undefined,
    condition: ad.condition ?? undefined,
    isFeatured: ad.isFeatured,
    publishedAt: ad.publishedAt ?? undefined,
  };
}
