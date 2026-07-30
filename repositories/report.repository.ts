import mongoose from "mongoose";
import { ReportModel, type ReportDocument } from "@/models/Report";
import type { ReportStatus, ReportTargetType } from "@/types";
import { serialize, serializeMany, type Serialized } from "./serialize";

export type SerializedReport = Serialized<ReportDocument>;

export type CreateReportInput = {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
};

export async function create(input: CreateReportInput): Promise<SerializedReport> {
  const doc = await ReportModel.create({
    reporterId: new mongoose.Types.ObjectId(input.reporterId),
    targetType: input.targetType,
    targetId: new mongoose.Types.ObjectId(input.targetId),
    reason: input.reason,
    details: input.details,
  });
  return serialize(doc.toObject()) as SerializedReport;
}

export async function list(
  page: number,
  limit: number,
  status?: ReportStatus,
): Promise<{ items: SerializedReport[]; total: number }> {
  const filter: { status?: ReportStatus } = {};
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    ReportModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ReportModel.countDocuments(filter),
  ]);
  return { items: serializeMany(docs), total };
}

export async function updateStatus(
  id: string,
  status: ReportStatus,
): Promise<SerializedReport | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await ReportModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
  return serialize(doc) ?? null;
}

export async function countOpen(): Promise<number> {
  return ReportModel.countDocuments({ status: "open" });
}
