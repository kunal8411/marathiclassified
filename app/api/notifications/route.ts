import { z } from "zod";
import type { ZodSchema } from "zod";
import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { siteConfig } from "@/config/site";
import * as notificationService from "@/services/notification.service";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export const GET = createApiHandler({
  auth: true,
  querySchema: listQuerySchema as ZodSchema<z.infer<typeof listQuerySchema>>,
  handler: async ({ user, query }) => {
    const limit = query.limit as typeof siteConfig.pageSize;
    const { items, meta } = await notificationService.list(
      user!.id,
      query.page,
      limit,
      query.unreadOnly,
    );
    return ok(items, meta);
  },
});

export const PATCH = createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    const data = await notificationService.markAllRead(user!.id);
    return ok(data);
  },
});
