import { NextRequest, NextResponse } from "next/server";

type RateLimitBucket = {
  count: number;
  reset: number;
};

const buckets = new Map<string, RateLimitBucket>();

/**
 * Simple in-memory rate limiter for serverless.
 * For production at scale, use Redis.
 */
export function rateLimitKey(
  req: NextRequest,
  suffix: string,
): { key: string; remaining: number; reset: number } {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const key = `${ip}:${suffix}`;

  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || bucket.reset < now) {
    bucket = { count: 0, reset: now + 60_000 }; // 1 min window
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  // Cleanup old buckets every 100 calls
  if (Math.random() < 0.01) {
    for (const [k, v] of buckets) {
      if (v.reset < now) buckets.delete(k);
    }
  }

  return {
    key,
    remaining: Math.max(0, 5 - bucket.count), // 5 attempts per minute
    reset: bucket.reset,
  };
}

export function createRateLimitResponse(limit: ReturnType<typeof rateLimitKey>): NextResponse {
  return new NextResponse(
    JSON.stringify({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Try again in 1 minute.",
      },
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((limit.reset - Date.now()) / 1000)),
        "X-RateLimit-Remaining": String(limit.remaining),
        "X-RateLimit-Reset": String(limit.reset),
      },
    },
  ) as NextResponse;
}
