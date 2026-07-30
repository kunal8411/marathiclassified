import { z } from "zod";
import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import * as chatService from "@/services/chat.service";

const typingSchema = z.object({
  isTyping: z.boolean().default(true),
});

export const POST = createApiHandler({
  auth: true,
  bodySchema: typingSchema,
  handler: async ({ user, params, body }) => {
    await chatService.typing(params.id, user!.id, body.isTyping ?? true);
    return ok({ ok: true });
  },
});
