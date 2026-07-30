"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api/client";
import { toAdCard } from "@/lib/ads/to-ad-card";
import type { Locale } from "@/config/site";
import type { SerializedAd } from "@/repositories/ad.repository";
import { AdCard } from "@/components/ads/ad-card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";

type ModerationQueueProps = {
  locale: Locale;
};

export function ModerationQueue({ locale }: ModerationQueueProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "ads", "pending"],
    queryFn: async () => {
      const res = await apiFetch<SerializedAd[]>("/api/admin/ads?limit=20");
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
  });

  const moderate = async (id: string, action: "approve" | "reject") => {
    const path =
      action === "approve"
        ? `/api/admin/ads/${id}/approve`
        : `/api/admin/ads/${id}/reject`;
    const res = await apiFetch(path, {
      method: "POST",
      body: action === "reject" ? { reason: "Does not meet guidelines" } : undefined,
    });
    if (!res.success) {
      toast.error(res.error.message);
      return;
    }
    toast.success(action === "approve" ? "Ad approved" : "Ad rejected");
    void refetch();
  };

  if (isLoading) return <LoadingState label="Loading queue…" />;

  const items = data ?? [];
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No ads pending review.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((ad) => (
          <div key={ad.id} className="space-y-2">
            <AdCard ad={toAdCard(ad, locale)} locale={locale === "mr" ? "mr-IN" : "en-IN"} />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => moderate(ad.id, "approve")}>
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => moderate(ad.id, "reject")}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
