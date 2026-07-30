import { SignJWT, jwtVerify } from "jose";
import type { JwtPayload } from "@/types";

function getAccessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not set");
  return new TextEncoder().encode(secret);
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

function claims(payload: JwtPayload) {
  return {
    role: payload.role,
    ...(payload.email ? { email: payload.email } : {}),
    ...(payload.phone ? { phone: payload.phone } : {}),
  };
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(claims(payload))
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getAccessSecret());
}

export async function signRefreshToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(claims(payload))
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getAccessSecret());
  return {
    sub: String(payload.sub),
    role: payload.role as JwtPayload["role"],
    email: payload.email as string | undefined,
    phone: payload.phone as string | undefined,
  };
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getRefreshSecret());
  return {
    sub: String(payload.sub),
    role: payload.role as JwtPayload["role"],
    email: payload.email as string | undefined,
    phone: payload.phone as string | undefined,
  };
}
