import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";

export const GET = createApiHandler({
  handler: async () => ok({ status: "ok", time: new Date().toISOString() }),
});
