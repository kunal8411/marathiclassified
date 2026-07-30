import { siteConfig } from "@/config/site";
import type { ApiResponse } from "@/types";

function apiBase(): string {
  return siteConfig.url.replace(/\/$/, "");
}

export async function serverFetch<T>(
  path: string,
  init?: RequestInit & { next?: NextFetchRequestConfig },
): Promise<T | null> {
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PHASE === "phase-export"
  ) {
    return null;
  }

  const url = path.startsWith("http") ? path : `${apiBase()}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      next: init?.next ?? { revalidate: 60 },
    });
    const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
    if (!json?.success) return null;
    return json.data;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
