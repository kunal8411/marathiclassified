import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import * as categoryService from "@/services/category.service";

export const GET = createApiHandler({
  handler: async ({ params }) => {
    const data = await categoryService.getBySlug(params.slug);
    return ok(data);
  },
});
