import { z } from "zod";
import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import * as adService from "@/services/ad.service";

const featuredQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const GET = createApiHandler({
  querySchema: featuredQuerySchema,
  handler: async ({ query }) => {
    const data = await adService.featured(query.limit);
    return ok(data);
  },
});
