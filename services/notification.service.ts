import { NotFoundError } from "@/lib/api/errors";
import { siteConfig } from "@/config/site";
import type { PaginationMeta } from "@/types";
import * as notificationRepo from "@/repositories/notification.repository";
import type { SerializedNotification } from "@/repositories/notification.repository";

function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function list(
  userId: string,
  page = 1,
  limit = siteConfig.pageSize,
  unreadOnly?: boolean,
): Promise<{ items: SerializedNotification[]; meta: PaginationMeta }> {
  const { items, total } = await notificationRepo.listByUser(userId, page, limit, unreadOnly);
  return { items, meta: paginationMeta(page, limit, total) };
}

export async function markRead(
  userId: string,
  notificationId: string,
): Promise<SerializedNotification> {
  const updated = await notificationRepo.markRead(notificationId, userId);
  if (!updated) throw new NotFoundError("Notification not found");
  return updated;
}

export async function markAllRead(userId: string): Promise<{ updated: number }> {
  const updated = await notificationRepo.markAllRead(userId);
  return { updated };
}
