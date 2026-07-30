import { z } from "zod";
import type { ZodSchema } from "zod";
import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { adListQuerySchema } from "@/validators";
import * as adService from "@/services/ad.service";

const pendingAdsQuerySchema = adListQuerySchema.pick({ page: true, limit: true });

export const GET = createApiHandler({
  roles: ["admin"],
  querySchema: pendingAdsQuerySchema as ZodSchema<z.infer<typeof pendingAdsQuerySchema>>,
  handler: async ({ query }) => {
    const { items, meta } = await adService.listAds({
      page: query.page,
      limit: query.limit,
      status: "pending",
    });
    return ok(items, meta);
  },
});
