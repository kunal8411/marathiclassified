import type { ApiResponse } from "@/types";

type ApiFetchInit = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiFetch<T>(
  path: string,
  init?: ApiFetchInit,
): Promise<ApiResponse<T>> {
  const { body, headers, ...rest } = init ?? {};
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const json = (await res.json().catch(() => ({
    success: false,
    error: { code: "PARSE_ERROR", message: "Invalid response" },
  }))) as ApiResponse<T>;

  return json;
}

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    sp.set(key, String(value));
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
}
