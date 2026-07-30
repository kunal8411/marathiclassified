"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";
import type { SerializedAd } from "@/repositories/ad.repository";
import type { SerializedChat } from "@/repositories/chat.repository";
import type { AdWriteInput } from "@/services/ad.service";

export function useAd(id: string | undefined) {
  return useQuery({
    queryKey: ["ad", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await apiFetch<SerializedAd>(`/api/ads/${id}`);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
  });
}

export function useCreateAdDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AdWriteInput) => {
      const res = await apiFetch<SerializedAd>("/api/ads/draft", {
        method: "POST",
        body,
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: (ad) => {
      qc.setQueryData(["ad", ad.id], ad);
    },
  });
}

export function useUpdateAd(id: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<AdWriteInput>) => {
      if (!id) throw new Error("Missing ad id");
      const res = await apiFetch<SerializedAd>(`/api/ads/${id}`, {
        method: "PATCH",
        body,
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: (ad) => {
      qc.setQueryData(["ad", id], ad);
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function usePublishAd(id: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Missing ad id");
      const res = await apiFetch<SerializedAd>(`/api/ads/${id}/publish`, {
        method: "POST",
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ad", id] });
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useStartChat() {
  return useMutation({
    mutationFn: async (adId: string) => {
      const res = await apiFetch<SerializedChat>("/api/chats", {
        method: "POST",
        body: { adId },
      });
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
  });
}
