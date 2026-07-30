import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import * as adminService from "@/services/admin.service";

export const GET = createApiHandler({
  roles: ["admin"],
  handler: async () => {
    const data = await adminService.analytics();
    return ok(data);
  },
});
