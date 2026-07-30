import type { NextRequest, NextResponse } from "next/server";

const DEFAULT_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  "http://localhost:3000",
];

export function getAllowedOrigin(req: NextRequest): string | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  const allowlist = (process.env.CORS_ORIGINS ?? DEFAULT_ORIGINS.join(","))
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return allowlist.includes(origin) ? origin : null;
}

export function applyCorsHeaders(res: NextResponse, origin: string | null): NextResponse {
  if (origin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
  }
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-CSRF-Token",
  );
  return res;
}
