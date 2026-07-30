import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { searchQuerySchema } from "@/validators";
import { validateSearchInput } from "@/lib/security/input-validation";
import { logger } from "@/lib/middleware/logging";
import { ValidationError } from "@/lib/api/errors";
import * as adService from "@/services/ad.service";

export const GET = createApiHandler({
  querySchema: searchQuerySchema,
  handler: async ({ query }) => {
    const { q, page, limit, categoryId } = query;
    
    // Validate search input
    const validation = validateSearchInput(q);
    if (!validation.valid) {
      logger.warn("Invalid search input", { metadata: { query: q, reason: validation.error } });
      throw new ValidationError(validation.error || "Invalid search");
    }

    const { items, meta } = await adService.search(q, { page, limit, categoryId });
    logger.info("Search executed", { metadata: { query: q, results: items.length } });
    return ok(items, meta);
  },
});
