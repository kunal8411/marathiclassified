import { z } from "zod";
import { createApiHandler } from "@/lib/api/handler";
import { created, ok } from "@/lib/api/response";
import { sendMessageSchema } from "@/validators";
import * as chatService from "@/services/chat.service";

const messagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const GET = createApiHandler({
  auth: true,
  querySchema: messagesQuerySchema,
  handler: async ({ user, params, query }) => {
    const { items, meta } = await chatService.getMessages(
      params.id,
      user!.id,
      query.page,
      query.limit,
    );
    return ok(items, meta);
  },
});

export const POST = createApiHandler({
  auth: true,
  bodySchema: sendMessageSchema,
  handler: async ({ user, params, body }) => {
    const data = await chatService.sendMessage(params.id, user!.id, body);
    return created(data);
  },
});
