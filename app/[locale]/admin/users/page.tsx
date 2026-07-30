import { setRequestLocale } from "next-intl/server";

import { AdminUsersPanel } from "@/features/admin/admin-users-panel";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminUsersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Users</h1>
      <AdminUsersPanel />
    </div>
  );
}
