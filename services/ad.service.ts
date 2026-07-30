import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/api/errors";
import { sanitizeOptionalText, sanitizeText } from "@/lib/security/xss";
import { triggerUserEvent } from "@/lib/pusher/server";
import { siteConfig } from "@/config/site";
import type { AdListQuery, AdStatus, PaginationMeta } from "@/types";
import * as adRepo from "@/repositories/ad.repository";
import * as categoryRepo from "@/repositories/category.repository";
import * as notificationRepo from "@/repositories/notification.repository";
import type { CreateAdInput, SerializedAd, UpdateAdInput } from "@/repositories/ad.repository";

export type AdWriteInput = Omit<CreateAdInput, "sellerId" | "status" | "publishedAt"> & {
  status?: "draft" | "pending";
};

function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

async function assertCategory(categoryId: string): Promise<void> {
  const category = await categoryRepo.findById(categoryId);
  if (!category?.isActive) {
    throw new ValidationError("Invalid category");
  }
}

function sanitizeAdFields<T extends { title?: string; description?: string }>(input: T): T {
  return {
    ...input,
    title: input.title != null ? sanitizeText(input.title) : input.title,
    description: input.description != null ? sanitizeText(input.description) : input.description,
  };
}

export async function createDraft(sellerId: string, input: AdWriteInput): Promise<SerializedAd> {
  await assertCategory(input.categoryId);
  const clean = sanitizeAdFields(input);
  return adRepo.create({
    ...clean,
    sellerId,
    status: input.status ?? "draft",
  });
}

export async function updateAd(
  adId: string,
  sellerId: string,
  input: Partial<AdWriteInput>,
  isAdmin = false,
): Promise<SerializedAd> {
  const ad = await adRepo.findById(adId);
  if (!ad) throw new NotFoundError("Ad not found");
  if (!isAdmin && String(ad.sellerId) !== sellerId) {
    throw new ForbiddenError("Not allowed to edit this ad");
  }
  if (input.categoryId) {
    await assertCategory(input.categoryId);
  }
  const clean = sanitizeAdFields(input);
  const updated = await adRepo.updateById(adId, clean as UpdateAdInput);
  if (!updated) throw new NotFoundError("Ad not found");
  return updated;
}

export async function publishAd(adId: string, sellerId: string): Promise<SerializedAd> {
  const ad = await adRepo.findById(adId);
  if (!ad) throw new NotFoundError("Ad not found");
  if (String(ad.sellerId) !== sellerId) {
    throw new ForbiddenError("Not allowed to publish this ad");
  }
  if (!ad.title || !ad.description || ad.price == null) {
    throw new ValidationError("Ad is incomplete");
  }
  if (!ad.images?.length) {
    throw new ValidationError("At least one image is required");
  }

  const updated = await adRepo.updateById(adId, {
    status: "pending",
    publishedAt: new Date(),
    rejectionReason: undefined,
  });
  if (!updated) throw new NotFoundError("Ad not found");
  return updated;
}

export async function getAd(adId: string, incrementView = true): Promise<SerializedAd> {
  const ad = await adRepo.findById(adId);
  if (!ad) throw new NotFoundError("Ad not found");
  if (incrementView && ad.status === "active") {
    await adRepo.incrementViews(adId);
    return { ...ad, views: ad.views + 1 };
  }
  return ad;
}

export async function listAds(query: AdListQuery): Promise<{ items: SerializedAd[]; meta: PaginationMeta }> {
  const page = query.page ?? 1;
  const limit = query.limit ?? siteConfig.pageSize;
  const { items, total } = await adRepo.list({ ...query, page, limit });
  return { items, meta: paginationMeta(page, limit, total) };
}

export async function featured(limit = 10): Promise<SerializedAd[]> {
  return adRepo.findFeatured(limit);
}

export async function nearby(
  lat: number,
  lng: number,
  radiusKm: number,
  page: number,
  limit: number,
): Promise<{ items: SerializedAd[]; meta: PaginationMeta }> {
  const { items, total } = await adRepo.findNearby(lat, lng, radiusKm, page, limit);
  return { items, meta: paginationMeta(page, limit, total) };
}

export async function search(
  q: string,
  options: { page?: number; limit?: number; categoryId?: string } = {},
): Promise<{ items: SerializedAd[]; meta: PaginationMeta }> {
  const page = options.page ?? 1;
  const limit = options.limit ?? siteConfig.pageSize;
  const { items, total } = await adRepo.searchAtlas(q, { page, limit, categoryId: options.categoryId });
  return { items, meta: paginationMeta(page, limit, total) };
}

export async function deleteAd(adId: string, sellerId: string, isAdmin = false): Promise<void> {
  const ad = await adRepo.findById(adId);
  if (!ad) throw new NotFoundError("Ad not found");
  if (!isAdmin && String(ad.sellerId) !== sellerId) {
    throw new ForbiddenError("Not allowed to delete this ad");
  }
  const deleted = await adRepo.deleteById(adId);
  if (!deleted) throw new NotFoundError("Ad not found");
}

export async function approveAd(adId: string): Promise<SerializedAd> {
  const ad = await adRepo.findById(adId);
  if (!ad) throw new NotFoundError("Ad not found");

  const updated = await adRepo.updateById(adId, {
    status: "active",
    publishedAt: ad.publishedAt ?? new Date(),
    rejectionReason: undefined,
  });
  if (!updated) throw new NotFoundError("Ad not found");

  await notificationRepo.create({
    userId: String(ad.sellerId),
    type: "ad_approved",
    title: "Ad approved",
    body: `Your listing "${sanitizeOptionalText(ad.title) ?? "Ad"}" is now live.`,
    data: { adId },
  });

  await triggerUserEvent(String(ad.sellerId), "ad_approved", { adId });

  return updated;
}

export async function rejectAd(adId: string, reason: string): Promise<SerializedAd> {
  const ad = await adRepo.findById(adId);
  if (!ad) throw new NotFoundError("Ad not found");

  const rejectionReason = sanitizeText(reason);
  const updated = await adRepo.updateById(adId, {
    status: "rejected",
    rejectionReason,
  });
  if (!updated) throw new NotFoundError("Ad not found");

  await notificationRepo.create({
    userId: String(ad.sellerId),
    type: "ad_rejected",
    title: "Ad rejected",
    body: rejectionReason,
    data: { adId },
  });

  await triggerUserEvent(String(ad.sellerId), "ad_rejected", { adId, reason: rejectionReason });

  return updated;
}

export async function countByStatus(): Promise<Partial<Record<AdStatus, number>>> {
  return adRepo.countByStatus();
}
