import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import * as chatService from "@/services/chat.service";

export const POST = createApiHandler({
  auth: true,
  handler: async ({ user, params }) => {
    const data = await chatService.markRead(params.id, user!.id);
    return ok(data);
  },
});
