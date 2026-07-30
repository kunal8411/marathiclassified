import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import { OtpForm } from "@/features/auth/otp-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function VerifyOtpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Suspense>
        <OtpForm locale={locale} />
      </Suspense>
    </div>
  );
}
