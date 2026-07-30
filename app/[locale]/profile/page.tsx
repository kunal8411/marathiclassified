import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/config/site";
import { ProfileView } from "@/features/profile/profile-view";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <ProfileView locale={locale as Locale} />
    </div>
  );
}
