"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch, buildQuery } from "@/lib/api/client";
import type { ApiSuccess, PaginationMeta } from "@/types";
import type { SerializedChat } from "@/repositories/chat.repository";

export function useChats(page = 1) {
  return useQuery({
    queryKey: ["chats", page],
    queryFn: async () => {
      const res = await apiFetch<SerializedChat[]>(
        `/api/chats${buildQuery({ page })}`,
      );
      if (!res.success) throw new Error(res.error.message);
      return {
        items: res.data,
        meta: (res as ApiSuccess<SerializedChat[]>).meta as PaginationMeta | undefined,
      };
    },
  });
}

export function useMarkChatRead(chatId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiFetch<{ read: true }>(`/api/chats/${chatId}/read`, {
        method: "POST",
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}

export function useSendTyping(chatId: string) {
  return useMutation({
    mutationFn: async (typing: boolean) => {
      await apiFetch(`/api/chats/${chatId}/typing`, {
        method: "POST",
        body: { isTyping: typing },
      });
    },
  });
}
