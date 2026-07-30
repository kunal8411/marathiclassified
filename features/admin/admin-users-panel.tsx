"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api/client";
import type { SerializedUser } from "@/repositories/user.repository";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";

export function AdminUsersPanel() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await apiFetch<SerializedUser[]>("/api/admin/users?limit=50");
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
  });

  const ban = useMutation({
    mutationFn: async ({ id, banned }: { id: string; banned: boolean }) => {
      const res = await apiFetch(`/api/admin/users/${id}/ban`, {
        method: "POST",
        body: { banned, reason: banned ? "Policy violation" : "Reinstated" },
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User updated");
      void refetch();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
  });

  if (isLoading) return <LoadingState label="Loading users…" />;

  return (
    <ul className="divide-y rounded-xl border bg-card">
      {data?.map((user) => (
        <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              {user.email ?? user.phone} · {user.role}
              {user.isBanned ? " · banned" : ""}
            </p>
          </div>
          <Button
            size="sm"
            variant={user.isBanned ? "outline" : "destructive"}
            onClick={() => ban.mutate({ id: user.id, banned: !user.isBanned })}
          >
            {user.isBanned ? "Unban" : "Ban"}
          </Button>
        </li>
      ))}
    </ul>
  );
}
