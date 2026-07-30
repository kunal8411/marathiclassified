import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import * as adService from "@/services/ad.service";

export const POST = createApiHandler({
  roles: ["admin"],
  handler: async ({ params }) => {
    const data = await adService.approveAd(params.id);
    return ok(data);
  },
});
