import { NotFoundError, RateLimitError, ValidationError } from "@/lib/api/errors";
import { hashOtp, verifyOtpHash } from "@/lib/auth/password";
import { sendOtpEmail } from "@/lib/resend";
import { sendOtpSms } from "@/lib/twilio";
import { rateLimit } from "@/lib/security/rate-limit";
import { siteConfig } from "@/config/site";
import type { OtpChannel, OtpPurpose } from "@/types";
import { generateOtp } from "@/utils/index";
import * as otpRepo from "@/repositories/otp.repository";
import type { SerializedOtp } from "@/repositories/otp.repository";

const MAX_OTP_ATTEMPTS = 5;

export type SendOtpInput = {
  channel: OtpChannel;
  destination: string;
  purpose: OtpPurpose;
  meta?: Record<string, unknown>;
};

export type VerifyOtpInput = {
  channel: OtpChannel;
  destination: string;
  purpose: OtpPurpose;
  code: string;
};

function normalizeDestination(channel: OtpChannel, destination: string): string {
  return channel === "email" ? destination.trim().toLowerCase() : destination.trim();
}

export async function sendOtp(input: SendOtpInput): Promise<{ sent: true }> {
  const destination = normalizeDestination(input.channel, input.destination);
  const limited = rateLimit(`otp:send:${destination}`, 5, 15 * 60_000);
  if (!limited.ok) {
    throw new RateLimitError("Too many OTP requests. Try again later.");
  }

  const code = generateOtp(siteConfig.otpLength);
  const codeHash = await hashOtp(code);
  const expiresAt = new Date(Date.now() + siteConfig.otpExpiryMinutes * 60 * 1000);

  await otpRepo.create({
    channel: input.channel,
    destination,
    purpose: input.purpose,
    codeHash,
    expiresAt,
    meta: input.meta,
  });

  if (input.channel === "email") {
    await sendOtpEmail(destination, code);
  } else {
    await sendOtpSms(destination, code);
  }

  return { sent: true };
}

export async function verifyOtp(input: VerifyOtpInput): Promise<SerializedOtp> {
  const destination = normalizeDestination(input.channel, input.destination);
  const record = await otpRepo.findLatestActive(input.channel, destination, input.purpose);

  if (!record) {
    throw new NotFoundError("OTP not found or expired");
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    throw new RateLimitError("Too many OTP attempts");
  }

  const updated = await otpRepo.incrementAttempts(record.id);
  const attempts = updated?.attempts ?? record.attempts + 1;

  const valid = await verifyOtpHash(input.code, record.codeHash);
  if (!valid) {
    if (attempts >= MAX_OTP_ATTEMPTS) {
      throw new RateLimitError("Too many OTP attempts");
    }
    throw new ValidationError("Invalid verification code");
  }

  const consumed = await otpRepo.consume(record.id);
  if (!consumed) {
    throw new NotFoundError("OTP not found or expired");
  }

  return consumed;
}
