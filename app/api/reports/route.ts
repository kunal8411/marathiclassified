import { z } from "zod";
import type { ZodSchema } from "zod";
import { createApiHandler } from "@/lib/api/handler";
import { created, ok } from "@/lib/api/response";
import { createReportSchema } from "@/validators";
import { siteConfig } from "@/config/site";
import * as reportService from "@/services/report.service";

const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(["open", "resolved", "dismissed"]).optional(),
});

export const GET = createApiHandler({
  roles: ["admin"],
  querySchema: adminListQuerySchema as ZodSchema<z.infer<typeof adminListQuerySchema>>,
  handler: async ({ query }) => {
    const limit = query.limit as typeof siteConfig.pageSize;
    const { items, meta } = await reportService.listReports(query.page, limit, query.status);
    return ok(items, meta);
  },
});

export const POST = createApiHandler({
  auth: true,
  bodySchema: createReportSchema,
  handler: async ({ user, body }) => {
    const data = await reportService.createReport({
      reporterId: user!.id,
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason,
      details: body.details,
    });
    return created(data);
  },
});
