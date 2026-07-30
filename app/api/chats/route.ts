import { z } from "zod";
import type { ZodSchema } from "zod";
import { createApiHandler } from "@/lib/api/handler";
import { created, ok } from "@/lib/api/response";
import { createChatSchema } from "@/validators";
import { siteConfig } from "@/config/site";
import * as chatService from "@/services/chat.service";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const GET = createApiHandler({
  auth: true,
  querySchema: listQuerySchema as ZodSchema<z.infer<typeof listQuerySchema>>,
  handler: async ({ user, query }) => {
    const limit = query.limit as typeof siteConfig.pageSize;
    const { items, meta } = await chatService.listChats(user!.id, query.page, limit);
    return ok(items, meta);
  },
});

export const POST = createApiHandler({
  auth: true,
  bodySchema: createChatSchema,
  handler: async ({ user, body }) => {
    const data = await chatService.startChat(body.adId, user!.id);
    return created(data);
  },
});
