import { createApiHandler } from "@/lib/api/handler";
import { created, ok } from "@/lib/api/response";
import { adListQuerySchema, createAdSchema } from "@/validators";
import type { AdWriteInput } from "@/services/ad.service";
import * as adService from "@/services/ad.service";
import type { ZodSchema, z } from "zod";

export const GET = createApiHandler({
  querySchema: adListQuerySchema as ZodSchema<z.infer<typeof adListQuerySchema>>,
  handler: async ({ query }) => {
    const { items, meta } = await adService.listAds(query);
    return ok(items, meta);
  },
});

export const POST = createApiHandler({
  auth: true,
  bodySchema: createAdSchema,
  handler: async ({ user, body }) => {
    const data = await adService.createDraft(user!.id, body as unknown as AdWriteInput);
    return created(data);
  },
});
