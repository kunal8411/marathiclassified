import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { nearbyQuerySchema } from "@/validators";
import * as adService from "@/services/ad.service";
import type { ZodSchema } from "zod";
import type { z } from "zod";

export const GET = createApiHandler({
  querySchema: nearbyQuerySchema as ZodSchema<z.infer<typeof nearbyQuerySchema>>,
  handler: async ({ query }) => {
    const { lat, lng, radiusKm, page, limit } = query;
    const { items, meta } = await adService.nearby(lat, lng, radiusKm, page, limit);
    return ok(items, meta);
  },
});
