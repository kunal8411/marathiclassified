/**
 * Edge-compatible JWT HS256 verify using Web Crypto only (no jose/JWE).
 */
import type { JwtPayload } from "@/types";

function b64UrlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToJson(bytes: Uint8Array): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
}

export async function verifyAccessTokenEdge(token: string): Promise<JwtPayload> {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not set");

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");

  const [headerB64, payloadB64, signatureB64] = parts;
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = new Uint8Array(b64UrlToBytes(signatureB64));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const valid = await crypto.subtle.verify("HMAC", key, signature, data);
  if (!valid) throw new Error("Invalid token signature");

  const payload = bytesToJson(b64UrlToBytes(payloadB64));
  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    throw new Error("Token expired");
  }

  return {
    sub: String(payload.sub),
    role: payload.role as JwtPayload["role"],
    email: typeof payload.email === "string" ? payload.email : undefined,
    phone: typeof payload.phone === "string" ? payload.phone : undefined,
  };
}
