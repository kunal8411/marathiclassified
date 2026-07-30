import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { adminRejectSchema } from "@/validators";
import * as adService from "@/services/ad.service";

export const POST = createApiHandler({
  roles: ["admin"],
  bodySchema: adminRejectSchema,
  handler: async ({ params, body }) => {
    const data = await adService.rejectAd(params.id, body.reason);
    return ok(data);
  },
});
