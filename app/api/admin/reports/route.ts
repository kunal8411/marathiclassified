import { z } from "zod";
import type { ZodSchema } from "zod";
import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { updateReportSchema } from "@/validators";
import { siteConfig } from "@/config/site";
import * as reportService from "@/services/report.service";

const adminReportsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(["open", "resolved", "dismissed"]).optional(),
});

const adminUpdateReportSchema = updateReportSchema.extend({
  reportId: z.string().min(1),
});

export const GET = createApiHandler({
  roles: ["admin"],
  querySchema: adminReportsQuerySchema as ZodSchema<z.infer<typeof adminReportsQuerySchema>>,
  handler: async ({ query }) => {
    const limit = query.limit as typeof siteConfig.pageSize;
    const { items, meta } = await reportService.listReports(query.page, limit, query.status);
    return ok(items, meta);
  },
});

export const PATCH = createApiHandler({
  roles: ["admin"],
  bodySchema: adminUpdateReportSchema,
  handler: async ({ body }) => {
    const data = await reportService.updateReport(body.reportId, body.status);
    return ok(data);
  },
});
