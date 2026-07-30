import { setRequestLocale } from "next-intl/server";

import { RegisterForm } from "@/features/auth/register-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <RegisterForm locale={locale} />
    </div>
  );
}
