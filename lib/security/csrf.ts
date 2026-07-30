import Tokens from "csrf";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { COOKIE_CSRF } from "@/constants";
import { ForbiddenError } from "@/lib/api/errors";

const tokens = new Tokens();

function getSecret() {
  return process.env.CSRF_SECRET ?? process.env.JWT_ACCESS_SECRET ?? "dev-csrf-secret-change-me";
}

export async function createCsrfToken(): Promise<string> {
  const secret = getSecret();
  const token = tokens.create(secret);
  const jar = await cookies();
  jar.set(COOKIE_CSRF, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return token;
}

export async function verifyCsrf(req: NextRequest): Promise<void> {
  if (process.env.NODE_ENV === "development" && process.env.CSRF_DISABLED === "true") {
    return;
  }

  const headerToken = req.headers.get("x-csrf-token");
  const jar = await cookies();
  const cookieToken = jar.get(COOKIE_CSRF)?.value;
  const token = headerToken ?? cookieToken;

  if (!token || !tokens.verify(getSecret(), token)) {
    throw new ForbiddenError("Invalid CSRF token");
  }
}
