import { z } from "zod";
import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import * as uploadService from "@/services/upload.service";

const signBodySchema = z.object({
  folder: z.string().optional(),
});

export const POST = createApiHandler({
  auth: true,
  bodySchema: signBodySchema,
  handler: async ({ body }) => {
    const data = uploadService.getSignedUpload(body.folder);
    return ok(data);
  },
});
