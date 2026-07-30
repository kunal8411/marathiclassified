import { ConflictError, ForbiddenError, UnauthorizedError, ValidationError } from "@/lib/api/errors";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearAuthCookies, createAuthTokens } from "@/lib/auth/session";
import { sanitizeText } from "@/lib/security/xss";
import type { JwtPayload, OtpChannel, SessionUser } from "@/types";
import * as userRepo from "@/repositories/user.repository";
import * as otpService from "@/services/otp.service";

function optStr(value: string | null | undefined): string | undefined {
  return value ?? undefined;
}

function toSessionUser(user: {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
  role: SessionUser["role"];
  isBanned: boolean;
}): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: optStr(user.email),
    phone: optStr(user.phone),
    image: optStr(user.image),
    role: user.role,
    isBanned: user.isBanned,
  };
}

function toJwtPayload(user: {
  id: string;
  role: SessionUser["role"];
  email?: string | null;
  phone?: string | null;
}): JwtPayload {
  return {
    sub: user.id,
    role: user.role,
    email: optStr(user.email),
    phone: optStr(user.phone),
  };
}

export type AuthResult = {
  user: SessionUser;
  tokens: { access: string; refresh: string };
};

export type RegisterStartInput = {
  channel: OtpChannel;
  destination: string;
  name: string;
  password: string;
  email?: string;
  phone?: string;
};

export type LoginInput = {
  email?: string;
  phone?: string;
  password: string;
};

export type VerifyRegistrationInput = {
  channel: OtpChannel;
  destination: string;
  code: string;
};

function destinationForChannel(
  channel: OtpChannel,
  email?: string,
  phone?: string,
  destination?: string,
): string {
  if (destination) {
    return channel === "email" ? destination.trim().toLowerCase() : destination.trim();
  }
  if (channel === "email" && email) return email.trim().toLowerCase();
  if (channel === "phone" && phone) return phone.trim();
  throw new ValidationError("Email or phone is required");
}

export async function registerStart(input: RegisterStartInput): Promise<{ sent: true }> {
  const name = sanitizeText(input.name);
  const destination = destinationForChannel(
    input.channel,
    input.email,
    input.phone,
    input.destination,
  );

  if (input.channel === "email") {
    const existing = await userRepo.findByEmail(destination);
    if (existing) throw new ConflictError("Email already registered");
  } else {
    const existing = await userRepo.findByPhone(destination);
    if (existing) throw new ConflictError("Phone already registered");
  }

  await otpService.sendOtp({
    channel: input.channel,
    destination,
    purpose: "register",
    meta: {
      name,
      password: input.password,
      email: input.channel === "email" ? destination : input.email?.trim().toLowerCase(),
      phone: input.channel === "phone" ? destination : input.phone?.trim(),
    },
  });

  return { sent: true };
}

export async function verifyRegistration(input: VerifyRegistrationInput): Promise<AuthResult> {
  const destination =
    input.channel === "email" ? input.destination.trim().toLowerCase() : input.destination.trim();

  const otp = await otpService.verifyOtp({
    channel: input.channel,
    destination,
    purpose: "register",
    code: input.code,
  });

  const meta = otp.meta as {
    name?: string;
    password?: string;
    email?: string;
    phone?: string;
  };

  if (!meta.name || !meta.password) {
    throw new ValidationError("Registration data expired; please start again");
  }

  const passwordHash = await hashPassword(meta.password);
  const email = meta.email ?? (input.channel === "email" ? destination : undefined);
  const phone = meta.phone ?? (input.channel === "phone" ? destination : undefined);

  if (email) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new ConflictError("Email already registered");
  }
  if (phone) {
    const existing = await userRepo.findByPhone(phone);
    if (existing) throw new ConflictError("Phone already registered");
  }

  const user = await userRepo.create({
    name: sanitizeText(meta.name),
    email,
    phone,
    passwordHash,
    emailVerifiedAt: input.channel === "email" ? new Date() : undefined,
    phoneVerifiedAt: input.channel === "phone" ? new Date() : undefined,
  });

  if (user.isBanned) {
    throw new ForbiddenError("Account is banned");
  }

  const tokens = await createAuthTokens(toJwtPayload(user));
  return { user: toSessionUser(user), tokens };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();

  const user =
    (email ? await userRepo.findByEmail(email) : null) ??
    (phone ? await userRepo.findByPhone(phone) : null);

  if (!user?.passwordHash) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  if (user.isBanned) {
    throw new ForbiddenError("Account is banned");
  }

  await userRepo.updateById(user.id, { lastActiveAt: new Date() });

  const tokens = await createAuthTokens(toJwtPayload(user));
  return { user: toSessionUser(user), tokens };
}

export async function logout(): Promise<void> {
  await clearAuthCookies();
}
