import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { rateUserSchema } from "@/validators";
import * as userService from "@/services/user.service";

export const POST = createApiHandler({
  auth: true,
  bodySchema: rateUserSchema,
  handler: async ({ user, params, body }) => {
    const data = await userService.rateSeller({
      sellerId: params.id,
      raterId: user!.id,
      score: body.score,
      comment: body.comment,
    });
    return ok(data);
  },
});
