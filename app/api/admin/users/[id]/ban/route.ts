import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { NotFoundError } from "@/lib/api/errors";
import * as userRepo from "@/repositories/user.repository";
import { adminBanSchema } from "@/validators";

export const POST = createApiHandler({
  roles: ["admin"],
  bodySchema: adminBanSchema,
  handler: async ({ params, body }) => {
    const updated = await userRepo.banUser(params.id, body.banned ?? true, body.reason);
    if (!updated) {
      throw new NotFoundError("User not found");
    }
    return ok(updated);
  },
});
