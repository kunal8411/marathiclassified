"use client";

import { formatDistanceToNow } from "date-fns";

import { useNotifications, useMarkAllNotificationsRead } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";

export function NotificationsList() {
  const { data, isLoading } = useNotifications();
  const markAll = useMarkAllNotificationsRead();

  if (isLoading) return <LoadingState label="Loading notifications…" />;
  if (!data?.items.length) {
    return <EmptyState title="All caught up" description="No notifications yet." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending}
        >
          Mark all read
        </Button>
      </div>
      <ul className="divide-y rounded-xl border bg-card">
        {data.items.map((n) => (
          <li key={n.id} className="px-4 py-3">
            <p className="text-sm font-medium">{n.title}</p>
            <p className="text-sm text-muted-foreground">{n.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
