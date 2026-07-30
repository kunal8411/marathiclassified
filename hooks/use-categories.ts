"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";
import type { SerializedCategory } from "@/repositories/category.repository";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiFetch<SerializedCategory[]>("/api/categories");
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: ["category", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await apiFetch<SerializedCategory>(`/api/categories/${slug}`);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
  });
}
