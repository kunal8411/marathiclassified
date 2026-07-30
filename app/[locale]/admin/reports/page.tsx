import { setRequestLocale } from "next-intl/server";

import { AdminReportsPanel } from "@/features/admin/admin-reports-panel";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminReportsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Reports</h1>
      <AdminReportsPanel />
    </div>
  );
}
