import { setRequestLocale } from "next-intl/server";

import { LogoutClient } from "@/features/auth/logout-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LogoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <LogoutClient locale={locale} />
    </div>
  );
}
