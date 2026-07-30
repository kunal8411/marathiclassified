"use client";

import Link from "next/link";

import type { Locale } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { useAds } from "@/hooks/use-ads";
import { toAdCard } from "@/lib/ads/to-ad-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdCard } from "@/components/ads/ad-card";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";

type ProfileViewProps = {
  locale: Locale;
};

const statusLabel: Record<string, string> = {
  draft: "Draft",
  pending: "Pending review",
  active: "Live",
  rejected: "Rejected",
  sold: "Sold",
  archived: "Archived",
};

export function ProfileView({ locale }: ProfileViewProps) {
  const { data: user, isLoading } = useAuth();
  const myAds = useAds(
    { sellerId: user?.id, limit: 24 },
    { enabled: Boolean(user?.id) },
  );

  if (isLoading) return <LoadingState label="Loading profile…" />;
  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        Please{" "}
        <Link href={`/${locale}/login`} className="text-primary hover:underline">
          log in
        </Link>
        .
      </p>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-10">
      <div className="mx-auto max-w-lg space-y-6 rounded-xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email ?? user.phone}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/${locale}/profile/edit`}>Edit profile</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${locale}/notifications`}>Notifications</Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/sell`}>Post an ad</Link>
          </Button>
          {user.role === "admin" ? (
            <Button asChild variant="secondary">
              <Link href={`/${locale}/admin`}>Admin dashboard</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">My listings</h2>
          <p className="text-sm text-muted-foreground">
            Published ads stay hidden until an admin approves them.
          </p>
        </div>

        {myAds.isLoading ? <LoadingState label="Loading your ads…" /> : null}

        {!myAds.isLoading && !myAds.data?.items.length ? (
          <EmptyState
            title="No listings yet"
            description="Post your first ad to get started."
            actionLabel="Sell something"
            onAction={() => {
              window.location.href = `/${locale}/sell`;
            }}
          />
        ) : null}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {myAds.data?.items.map((ad) => (
            <div key={ad.id} className="space-y-2">
              <AdCard
                ad={toAdCard(ad, locale)}
                locale={locale === "mr" ? "mr-IN" : "en-IN"}
              />
              <Badge variant={ad.status === "active" ? "default" : "secondary"}>
                {statusLabel[ad.status] ?? ad.status}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
