import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import * as favoriteService from "@/services/favorite.service";

export const DELETE = createApiHandler({
  auth: true,
  handler: async ({ user, params }) => {
    const data = await favoriteService.remove(user!.id, params.adId);
    return ok(data);
  },
});
