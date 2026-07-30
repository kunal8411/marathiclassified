import { OtpModel, type OtpDocument } from "@/models/Otp";
import type { OtpChannel, OtpPurpose } from "@/types";
import { serialize, type Serialized } from "./serialize";

export type SerializedOtp = Serialized<OtpDocument>;

export type CreateOtpInput = {
  channel: OtpChannel;
  destination: string;
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  meta?: Record<string, unknown>;
};

export async function create(input: CreateOtpInput): Promise<SerializedOtp> {
  const doc = await OtpModel.create(input);
  return serialize(doc.toObject()) as SerializedOtp;
}

export async function findLatestActive(
  channel: OtpChannel,
  destination: string,
  purpose: OtpPurpose,
): Promise<SerializedOtp | null> {
  const normalized =
    channel === "email" ? destination.trim().toLowerCase() : destination.trim();
  const doc = await OtpModel.findOne({
    channel,
    destination: normalized,
    purpose,
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .lean();
  return serialize(doc) ?? null;
}

export async function consume(id: string): Promise<SerializedOtp | null> {
  const doc = await OtpModel.findByIdAndUpdate(
    id,
    { $set: { consumedAt: new Date() } },
    { new: true },
  ).lean();
  return serialize(doc) ?? null;
}

export async function incrementAttempts(id: string): Promise<SerializedOtp | null> {
  const doc = await OtpModel.findByIdAndUpdate(id, { $inc: { attempts: 1 } }, { new: true }).lean();
  return serialize(doc) ?? null;
}
