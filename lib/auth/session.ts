import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "@/constants";
import type { JwtPayload, SessionUser } from "@/types";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { connectDb } from "@/lib/db/connect";
import { UserModel } from "@/models/User";

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function createAuthTokens(payload: JwtPayload): Promise<{
  access: string;
  refresh: string;
}> {
  const access = await signAccessToken(payload);
  const refresh = await signRefreshToken(payload);
  return { access, refresh };
}

/** Attach auth cookies to a Route Handler response (reliable in Next.js 15). */
export function attachAuthCookies(
  res: NextResponse,
  tokens: { access: string; refresh: string },
): NextResponse {
  res.cookies.set(COOKIE_ACCESS, tokens.access, {
    ...authCookieOptions,
    maxAge: 60 * 15,
  });
  res.cookies.set(COOKIE_REFRESH, tokens.refresh, {
    ...authCookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export function clearAuthCookiesOnResponse(res: NextResponse): NextResponse {
  res.cookies.set(COOKIE_ACCESS, "", { ...authCookieOptions, maxAge: 0 });
  res.cookies.set(COOKIE_REFRESH, "", { ...authCookieOptions, maxAge: 0 });
  return res;
}

export async function setAuthCookies(payload: JwtPayload): Promise<{
  access: string;
  refresh: string;
}> {
  const tokens = await createAuthTokens(payload);
  const jar = await cookies();
  jar.set(COOKIE_ACCESS, tokens.access, { ...authCookieOptions, maxAge: 60 * 15 });
  jar.set(COOKIE_REFRESH, tokens.refresh, { ...authCookieOptions, maxAge: 60 * 60 * 24 * 7 });
  return tokens;
}

export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_ACCESS);
  jar.delete(COOKIE_REFRESH);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null;
  }

  const jar = await cookies();
  const access = jar.get(COOKIE_ACCESS)?.value;
  const refresh = jar.get(COOKIE_REFRESH)?.value;

  let payload: JwtPayload | null = null;

  if (access) {
    try {
      payload = await verifyAccessToken(access);
    } catch {
      payload = null;
    }
  }

  if (!payload && refresh) {
    try {
      payload = await verifyRefreshToken(refresh);
      await setAuthCookies(payload);
    } catch {
      return null;
    }
  }

  if (!payload) return null;

  await connectDb();
  const user = await UserModel.findById(payload.sub).lean();
  if (!user || user.isBanned) return null;

  return {
    id: String(user._id),
    name: user.name,
    email: user.email ?? undefined,
    phone: user.phone ?? undefined,
    image: user.image ?? undefined,
    role: user.role,
    isBanned: user.isBanned,
  };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    const { UnauthorizedError } = await import("@/lib/api/errors");
    throw new UnauthorizedError();
  }
  return user;
}
