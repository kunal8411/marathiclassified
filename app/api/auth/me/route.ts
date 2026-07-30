import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";

export const GET = createApiHandler({
  auth: true,
  handler: async ({ user }) => ok(user),
});
