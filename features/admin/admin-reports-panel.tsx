"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";

type ReportRow = {
  id: string;
  reason: string;
  status: string;
  targetType: string;
  targetId: string;
};

export function AdminReportsPanel() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const res = await apiFetch<ReportRow[]>("/api/admin/reports?limit=50");
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
  });

  const resolve = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/admin/reports`, {
        method: "PATCH",
        body: { reportId: id, status: "resolved" },
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Report updated");
      void refetch();
    },
  });

  if (isLoading) return <LoadingState label="Loading reports…" />;

  return (
    <ul className="divide-y rounded-xl border bg-card">
      {data?.map((report) => (
        <li key={report.id} className="space-y-2 px-4 py-3">
          <p className="text-sm font-medium">{report.reason}</p>
          <p className="text-xs text-muted-foreground">
            {report.targetType} {report.targetId} · {report.status}
          </p>
          {report.status === "open" ? (
            <Button size="sm" variant="outline" onClick={() => resolve.mutate(report.id)}>
              Resolve
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
