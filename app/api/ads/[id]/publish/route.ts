import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import * as adService from "@/services/ad.service";

export const POST = createApiHandler({
  auth: true,
  handler: async ({ user, params }) => {
    const data = await adService.publishAd(params.id, user!.id);
    return ok(data);
  },
});
