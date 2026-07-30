import { z } from "zod";
import type { ZodSchema } from "zod";
import { createApiHandler } from "@/lib/api/handler";
import { created, ok } from "@/lib/api/response";
import { favoriteSchema } from "@/validators";
import { siteConfig } from "@/config/site";
import * as favoriteService from "@/services/favorite.service";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const GET = createApiHandler({
  auth: true,
  querySchema: listQuerySchema as ZodSchema<z.infer<typeof listQuerySchema>>,
  handler: async ({ user, query }) => {
    const page = query.page;
    const limit = query.limit as typeof siteConfig.pageSize;
    const { items, meta } = await favoriteService.list(user!.id, page, limit);
    return ok(items, meta);
  },
});

export const POST = createApiHandler({
  auth: true,
  bodySchema: favoriteSchema,
  handler: async ({ user, body }) => {
    const data = await favoriteService.add(user!.id, body.adId);
    return created(data);
  },
});
