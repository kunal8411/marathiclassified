import { NotFoundError } from "@/lib/api/errors";
import { sanitizeOptionalText, sanitizeText } from "@/lib/security/xss";
import { siteConfig } from "@/config/site";
import type { PaginationMeta, ReportStatus, ReportTargetType } from "@/types";
import * as adRepo from "@/repositories/ad.repository";
import * as reportRepo from "@/repositories/report.repository";
import * as userRepo from "@/repositories/user.repository";
import type { SerializedReport } from "@/repositories/report.repository";

function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export type CreateReportInput = {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
};

async function assertTargetExists(targetType: ReportTargetType, targetId: string): Promise<void> {
  if (targetType === "ad") {
    const ad = await adRepo.findById(targetId);
    if (!ad) throw new NotFoundError("Report target not found");
    return;
  }
  const user = await userRepo.findById(targetId);
  if (!user) throw new NotFoundError("Report target not found");
}

export async function createReport(input: CreateReportInput): Promise<SerializedReport> {
  await assertTargetExists(input.targetType, input.targetId);
  return reportRepo.create({
    reporterId: input.reporterId,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: sanitizeText(input.reason),
    details: input.details ? sanitizeOptionalText(input.details) : undefined,
  });
}

export async function listReports(
  page = 1,
  limit = siteConfig.pageSize,
  status?: ReportStatus,
): Promise<{ items: SerializedReport[]; meta: PaginationMeta }> {
  const { items, total } = await reportRepo.list(page, limit, status);
  return { items, meta: paginationMeta(page, limit, total) };
}

export async function updateReport(
  reportId: string,
  status: ReportStatus,
): Promise<SerializedReport> {
  const updated = await reportRepo.updateStatus(reportId, status);
  if (!updated) throw new NotFoundError("Report not found");
  return updated;
}
