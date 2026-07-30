import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import { LoginForm } from "@/features/auth/login-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Suspense>
        <LoginForm locale={locale} />
      </Suspense>
    </div>
  );
}
