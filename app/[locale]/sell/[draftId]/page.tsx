import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/config/site";
import { SellForm } from "@/features/ads/sell-form";

type Props = {
  params: Promise<{ locale: string; draftId: string }>;
};

export default async function SellDraftPage({ params }: Props) {
  const { locale, draftId } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Continue your draft</h1>
      <SellForm locale={locale as Locale} draftId={draftId} />
    </div>
  );
}
