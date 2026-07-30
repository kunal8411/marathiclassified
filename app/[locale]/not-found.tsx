import Link from "next/link";

import { siteConfig, type Locale } from "@/config/site";

type Props = {
  params?: Promise<{ locale: string }>;
};

export default async function LocaleNotFound({ params }: Props) {
  const resolved = params ? await params : undefined;
  const locale = (
    siteConfig.locales.includes(resolved?.locale as Locale)
      ? resolved!.locale
      : siteConfig.defaultLocale
  ) as Locale;

  const isMarathi = locale === "mr";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
        404
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        {isMarathi ? "पृष्ठ सापडले नाही" : "Page not found"}
      </h1>
      <p className="text-slate-600 dark:text-slate-400">
        {isMarathi
          ? "तुम्ही शोधत असलेले पृष्ठ अस्तित्वात नाही किंवा हलवले आहे."
          : "The page you are looking for does not exist or has been moved."}
      </p>
      <Link
        href={`/${locale}`}
        className="mt-2 inline-flex rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
      >
        {isMarathi ? "मुख्यपृष्ठावर जा" : "Back to home"}
      </Link>
    </div>
  );
}
