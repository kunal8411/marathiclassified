import { createApiHandler } from "@/lib/api/handler";
import { created } from "@/lib/api/response";
import { createAdSchema } from "@/validators";
import type { AdWriteInput } from "@/services/ad.service";
import * as adService from "@/services/ad.service";

export const POST = createApiHandler({
  auth: true,
  bodySchema: createAdSchema,
  handler: async ({ user, body }) => {
    const data = await adService.createDraft(user!.id, {
      ...(body as unknown as AdWriteInput),
      status: "draft",
    });
    return created(data);
  },
});
