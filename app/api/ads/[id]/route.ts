import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { updateAdSchema } from "@/validators";
import type { AdWriteInput } from "@/services/ad.service";
import * as adService from "@/services/ad.service";

export const GET = createApiHandler({
  handler: async ({ params }) => {
    const data = await adService.getAd(params.id);
    return ok(data);
  },
});

export const PATCH = createApiHandler({
  auth: true,
  bodySchema: updateAdSchema,
  handler: async ({ user, params, body }) => {
    const data = await adService.updateAd(params.id, user!.id, body as Partial<AdWriteInput>);
    return ok(data);
  },
});

export const DELETE = createApiHandler({
  auth: true,
  handler: async ({ user, params }) => {
    await adService.deleteAd(params.id, user!.id);
    return ok({ deleted: true });
  },
});
