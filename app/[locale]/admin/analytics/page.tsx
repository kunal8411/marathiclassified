export const dynamic = "force-dynamic";

import { setRequestLocale } from "next-intl/server";

import { serverFetch } from "@/lib/api/server-fetch";
import type { AdminAnalytics } from "@/services/admin.service";
import { StatCards } from "@/features/admin/stat-cards";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAnalyticsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const analytics = await serverFetch<AdminAnalytics>("/api/admin/analytics", {
    cache: "no-store",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Analytics</h1>
      {analytics ? <StatCards data={analytics} /> : null}
    </div>
  );
}
