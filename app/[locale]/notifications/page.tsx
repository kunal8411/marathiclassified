import { setRequestLocale } from "next-intl/server";

import { NotificationsList } from "@/features/notifications/notifications-list";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NotificationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Notifications</h1>
      <NotificationsList />
    </div>
  );
}
