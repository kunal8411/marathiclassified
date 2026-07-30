"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch, buildQuery } from "@/lib/api/client";
import type { AdListQuery, ApiSuccess, PaginationMeta } from "@/types";
import type { SerializedAd } from "@/repositories/ad.repository";

export function useAds(query: AdListQuery = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["ads", query],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await apiFetch<SerializedAd[]>(
        `/api/ads${buildQuery(query as Record<string, string | number | boolean | undefined>)}`,
      );
      if (!res.success) throw new Error(res.error.message);
      return { items: res.data, meta: (res as ApiSuccess<SerializedAd[]>).meta as PaginationMeta | undefined };
    },
  });
}

export function useFeaturedAds(limit = 8) {
  return useQuery({
    queryKey: ["ads", "featured", limit],
    queryFn: async () => {
      const res = await apiFetch<SerializedAd[]>(`/api/ads/featured${buildQuery({ limit })}`);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
  });
}

export function useSearchAds(q: string, query: Omit<AdListQuery, "q"> = {}) {
  return useQuery({
    queryKey: ["ads", "search", q, query],
    enabled: q.trim().length > 0,
    queryFn: async () => {
      const res = await apiFetch<SerializedAd[]>(
        `/api/ads/search${buildQuery({ q, ...query })}`,
      );
      if (!res.success) throw new Error(res.error.message);
      return { items: res.data, meta: (res as ApiSuccess<SerializedAd[]>).meta as PaginationMeta | undefined };
    },
  });
}
