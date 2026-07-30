import { NotFoundError } from "@/lib/api/errors";
import { siteConfig } from "@/config/site";
import type { PaginationMeta } from "@/types";
import * as adRepo from "@/repositories/ad.repository";
import * as favoriteRepo from "@/repositories/favorite.repository";
import type { SerializedFavorite } from "@/repositories/favorite.repository";

function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function add(userId: string, adId: string): Promise<{ favorited: true }> {
  const ad = await adRepo.findById(adId);
  if (!ad || ad.status !== "active") {
    throw new NotFoundError("Ad not found");
  }
  const already = await favoriteRepo.exists(userId, adId);
  if (!already) {
    await favoriteRepo.add(userId, adId);
    await adRepo.incrementFavorites(adId, 1);
  }
  return { favorited: true };
}

export async function remove(userId: string, adId: string): Promise<{ favorited: false }> {
  const removed = await favoriteRepo.remove(userId, adId);
  if (removed) {
    await adRepo.incrementFavorites(adId, -1);
  }
  return { favorited: false };
}

export async function toggle(
  userId: string,
  adId: string,
): Promise<{ favorited: boolean }> {
  const exists = await favoriteRepo.exists(userId, adId);
  if (exists) {
    await remove(userId, adId);
    return { favorited: false };
  }
  await add(userId, adId);
  return { favorited: true };
}

export async function list(
  userId: string,
  page = 1,
  limit = siteConfig.pageSize,
): Promise<{ items: SerializedFavorite[]; meta: PaginationMeta }> {
  const { items, total } = await favoriteRepo.listByUser(userId, page, limit);
  return { items, meta: paginationMeta(page, limit, total) };
}
