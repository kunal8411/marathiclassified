import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/config/site";
import { ModerationQueue } from "@/features/admin/moderation-queue";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAdsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Ad moderation</h1>
      <ModerationQueue locale={locale as Locale} />
    </div>
  );
}
