"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface AdCardData {
  id: string;
  title: string;
  price: number;
  currency?: string;
  images?: Array<{ url: string; publicId: string }>;
  city?: string;
  area?: string;
  condition?: string;
  isFeatured?: boolean;
  publishedAt?: Date;
  views?: number;
  href?: string;
  status?: string;
}

interface AdCardProps {
  ad: AdCardData;
  locale: "en-IN" | "mr-IN";
  showStatus?: boolean;
}

function formatRelative(date: Date | string | undefined, isMarathi: boolean): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const day = 86_400_000;
  const hour = 3_600_000;
  const minute = 60_000;
  if (diff < hour) {
    const m = Math.max(1, Math.floor(diff / minute));
    return isMarathi ? `${m} मिनिटांपूर्वी` : `${m} min ago`;
  }
  if (diff < day) {
    const h = Math.floor(diff / hour);
    return isMarathi ? `${h} तासांपूर्वी` : `${h} hr ago`;
  }
  const days = Math.floor(diff / day);
  if (days < 30) {
    return isMarathi ? `${days} दिवसांपूर्वी` : `${days} day${days > 1 ? "s" : ""} ago`;
  }
  return d.toLocaleDateString(isMarathi ? "mr-IN" : "en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function AdCard({ ad, locale, showStatus = false }: AdCardProps) {
  const isMarathi = locale === "mr-IN";
  const imageUrl = ad.images?.[0]?.url || "/images/placeholder-ad.jpg";
  const [saved, setSaved] = useState(false);

  const formatPrice = useCallback(
    (price: number) => new Intl.NumberFormat(locale).format(price),
    [locale],
  );

  const statusBadgeConfig: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    active: { label: isMarathi ? "लाइव्ह" : "Live", variant: "default" },
    pending: { label: isMarathi ? "पुनरावलोकनात" : "Under Review", variant: "secondary" },
    draft: { label: isMarathi ? "मसुदा" : "Draft", variant: "outline" },
    rejected: { label: isMarathi ? "नाकारले" : "Rejected", variant: "destructive" },
    sold: { label: isMarathi ? "विकले गेले" : "Sold", variant: "secondary" },
  };

  const statusConfig =
    statusBadgeConfig[ad.status as keyof typeof statusBadgeConfig] || {
      label: ad.status,
      variant: "secondary" as const,
    };

  const location = [ad.area, ad.city].filter(Boolean).join(", ");

  const toggleSaved = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => !s);
  };

  return (
    <Link href={`/${locale.split("-")[0]}/ads/${ad.id}`} className="group block h-full">
      <Card className="overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-lg h-full flex flex-col py-0 gap-0">
        {/* Image */}
        <CardContent className="relative p-0 overflow-hidden">
          <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <Image
              src={imageUrl}
              alt={ad.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />

            {ad.isFeatured && (
              <span className="absolute left-0 top-2 rounded-r-md bg-yellow-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-900 shadow">
                {isMarathi ? "फीचर्ड" : "Featured"}
              </span>
            )}

            {showStatus && (
              <Badge
                variant={statusConfig.variant}
                className="absolute top-2 right-11 px-2 py-1"
              >
                {statusConfig.label}
              </Badge>
            )}

            {/* Save / favorite */}
            <button
              type="button"
              onClick={toggleSaved}
              aria-label={isMarathi ? "जतन करा" : "Save"}
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white dark:bg-slate-900/80"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  saved ? "fill-red-500 text-red-500" : "text-slate-600 dark:text-slate-300",
                )}
              />
            </button>
          </div>
        </CardContent>

        {/* Details — OLX order: price, title, location + date */}
        <div className="flex flex-1 flex-col gap-1 p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-50">
            ₹{formatPrice(ad.price)}
          </div>

          <h3 className="line-clamp-1 text-sm text-slate-700 dark:text-slate-300 group-hover:text-orange-600">
            {ad.title}
          </h3>

          <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[11px] uppercase text-slate-400 dark:text-slate-500">
            {location ? (
              <span className="flex min-w-0 items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </span>
            ) : (
              <span />
            )}
            {ad.publishedAt && (
              <span className="flex-shrink-0 normal-case">
                {formatRelative(ad.publishedAt, isMarathi)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
