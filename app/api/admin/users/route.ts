import { z } from "zod";
import type { ZodSchema } from "zod";
import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { UserModel } from "@/models/User";
import { serializeMany } from "@/repositories/serialize";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const GET = createApiHandler({
  roles: ["admin"],
  querySchema: listQuerySchema as ZodSchema<z.infer<typeof listQuerySchema>>,
  handler: async ({ query }) => {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      UserModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-passwordHash")
        .lean(),
      UserModel.countDocuments(),
    ]);

    const items = serializeMany(docs);
    const meta = {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
    return ok(items, meta);
  },
});
