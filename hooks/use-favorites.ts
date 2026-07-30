"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch, buildQuery } from "@/lib/api/client";
import type { ApiSuccess, PaginationMeta } from "@/types";
import type { SerializedAd } from "@/repositories/ad.repository";
import type { SerializedFavorite } from "@/repositories/favorite.repository";

export function useFavorites(page = 1) {
  return useQuery({
    queryKey: ["favorites", page],
    queryFn: async () => {
      const res = await apiFetch<SerializedFavorite[]>(
        `/api/favorites${buildQuery({ page })}`,
      );
      if (!res.success) throw new Error(res.error.message);
      return {
        items: res.data,
        meta: (res as ApiSuccess<SerializedFavorite[]>).meta as PaginationMeta | undefined,
      };
    },
  });
}

export function useFavoriteAds(page = 1) {
  const favs = useFavorites(page);
  return useQuery({
    queryKey: ["favorite-ads", page, favs.data?.items.map((f) => f.adId)],
    enabled: Boolean(favs.data?.items.length),
    queryFn: async () => {
      const results = await Promise.all(
        favs.data!.items.map(async (f) => {
          const res = await apiFetch<SerializedAd>(`/api/ads/${f.adId}`);
          return res.success ? res.data : null;
        }),
      );
      return results.filter((ad): ad is SerializedAd => ad != null && ad.status === "active");
    },
  });
}

export function useToggleFavorite(adId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (favorited: boolean) => {
      if (favorited) {
        const res = await apiFetch<{ favorited: false }>(`/api/favorites/${adId}`, {
          method: "DELETE",
        });
        if (!res.success) throw new Error(res.error.message);
        return false;
      }
      const res = await apiFetch<{ favorited: true }>("/api/favorites", {
        method: "POST",
        body: { adId },
      });
      if (!res.success) throw new Error(res.error.message);
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["favorite-ads"] });
    },
  });
}
