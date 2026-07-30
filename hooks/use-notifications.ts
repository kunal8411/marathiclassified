"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch, buildQuery } from "@/lib/api/client";
import type { ApiSuccess, NotificationType, PaginationMeta } from "@/types";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt?: string | Date | null;
  createdAt: string | Date;
  data?: Record<string, unknown>;
};

export function useNotifications(page = 1, unreadOnly?: boolean) {
  return useQuery({
    queryKey: ["notifications", page, unreadOnly],
    queryFn: async () => {
      const res = await apiFetch<NotificationItem[]>(
        `/api/notifications${buildQuery({ page, unreadOnly })}`,
      );
      if (!res.success) throw new Error(res.error.message);
      return {
        items: res.data,
        meta: (res as ApiSuccess<NotificationItem[]>).meta as PaginationMeta | undefined,
      };
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiFetch<{ updated: number }>("/api/notifications", {
        method: "PATCH",
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
