export const dynamic = "force-dynamic";

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { CheckCircle2, AlertCircle, Users, BarChart3 } from "lucide-react";

import { serverFetch } from "@/lib/api/server-fetch";
import type { AdminAnalytics } from "@/services/admin.service";
import type { Locale } from "@/config/site";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const prefix = `/${loc}`;
  const isMarathi = loc === "mr";

  const analytics = await serverFetch<AdminAnalytics>("/api/admin/analytics", {
    cache: "no-store",
  });

  const adminLinks = [
    {
      href: `${prefix}/admin/ads`,
      label: isMarathi ? "जाहिरात नियंत्रण" : "Moderate Ads",
      icon: CheckCircle2,
      description: isMarathi ? "प्रलंबित जाहिरातींचे पुनरावलोकन" : "Review pending listings",
      badge: analytics?.adsByStatus?.pending || 0,
    },
    {
      href: `${prefix}/admin/users`,
      label: isMarathi ? "वापरकर्ते" : "Users",
      icon: Users,
      description: isMarathi ? "वापरकर्ते व्यवस्थापित करा" : "Manage users & bans",
      badge: analytics?.users || 0,
    },
    {
      href: `${prefix}/admin/reports`,
      label: isMarathi ? "तक्रारी" : "Reports",
      icon: AlertCircle,
      description: isMarathi ? "वापरकर्त्यांच्या तक्रारी पहा" : "View user reports",
      badge: analytics?.openReports || 0,
    },
    {
      href: `${prefix}/admin/analytics`,
      label: isMarathi ? "विश्लेषण" : "Analytics",
      icon: BarChart3,
      description: isMarathi ? "प्लॅटफॉर्म आकडेवारी" : "View platform stats",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {isMarathi ? "व्यवस्थापक डॅशबोर्ड" : "Admin Dashboard"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {isMarathi
            ? "तुमचे मार्केटप्लेस व्यवस्थापित करा"
            : "Manage your marketplace"}
        </p>
      </div>

      {/* Stats Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {isMarathi ? "एकूण वापरकर्ते" : "Total Users"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.users}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {isMarathi ? "नोंदणीकृत वापरकर्ते" : "Registered users"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {isMarathi ? "एकूण जाहिराती" : "Total Ads"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(analytics.adsByStatus).reduce((sum, count) => (sum ?? 0) + (count ?? 0), 0 as number)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {isMarathi ? "सर्व जाहिराती" : "All listings"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-600">
                {isMarathi ? "प्रलंबित जाहिराती" : "Pending Ads"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {analytics.adsByStatus?.pending || 0}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {isMarathi
                  ? "पुनरावलोकनाच्या प्रतीक्षेत"
                  : "Awaiting review"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">
                {isMarathi ? "तक्रारी" : "Reports"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {analytics.openReports}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {isMarathi ? "खुल्या तक्रारी" : "Open reports"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {isMarathi ? "व्यवस्थापन पर्याय" : "Management Options"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="hover:border-orange-500/50 hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-orange-600" />
                          <CardTitle className="text-lg">
                            {link.label}
                          </CardTitle>
                        </div>
                        <CardDescription>
                          {link.description}
                        </CardDescription>
                      </div>
                      {link.badge !== undefined && (
                        <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                          {link.badge}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6">
        <h3 className="font-semibold mb-4">
          {isMarathi ? "त्वरित कृती" : "Quick Actions"}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link href={`${prefix}/admin/ads`}>
            <Button variant="outline" size="sm">
              {isMarathi ? "प्रलंबित जाहिरातींचे पुनरावलोकन" : "Review Pending Ads"}
            </Button>
          </Link>
          <Link href={`${prefix}`}>
            <Button variant="outline" size="sm">
              {isMarathi ? "मार्केटप्लेस पहा" : "View Marketplace"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Help text */}
      <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-900 dark:text-blue-200">
        <p className="font-medium mb-2">
          {isMarathi ? "📌 टीप:" : "📌 Tip:"}
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            {isMarathi
              ? "नवीन जाहिरातींना मंजुरी देण्यासाठी 'जाहिरात नियंत्रण' पहा"
              : "Check 'Moderate Ads' to approve new listings"}
          </li>
          <li>
            {isMarathi
              ? "तुम्ही कधीही वापरकर्त्यांना प्रतिबंधित करू शकता"
              : "You can ban users anytime"}
          </li>
          <li>
            {isMarathi
              ? "आकडेवारी रिअल-टाइममध्ये अपडेट होते"
              : "Analytics update in real-time"}
          </li>
        </ul>
      </div>
    </div>
  );
}
