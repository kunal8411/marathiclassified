"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch, buildQuery } from "@/lib/api/client";
import type { ApiSuccess, PaginationMeta } from "@/types";
import type { SerializedMessage } from "@/repositories/message.repository";

export function useMessages(chatId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ["messages", chatId, page],
    enabled: Boolean(chatId),
    queryFn: async () => {
      const res = await apiFetch<SerializedMessage[]>(
        `/api/chats/${chatId}/messages${buildQuery({ page, limit: 50 })}`,
      );
      if (!res.success) throw new Error(res.error.message);
      return {
        items: res.data,
        meta: (res as ApiSuccess<SerializedMessage[]>).meta as PaginationMeta | undefined,
      };
    },
    refetchInterval: 15_000,
  });
}

export function useSendMessage(chatId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const res = await apiFetch<SerializedMessage>(`/api/chats/${chatId}/messages`, {
        method: "POST",
        body: { body },
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", chatId] });
      qc.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}
