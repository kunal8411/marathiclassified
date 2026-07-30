import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import * as userService from "@/services/user.service";

export const GET = createApiHandler({
  handler: async ({ params }) => {
    const data = await userService.getPublicProfile(params.id);
    return ok(data);
  },
});
