import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { createCsrfToken } from "@/lib/security/csrf";

export const GET = createApiHandler({
  handler: async () => {
    const token = await createCsrfToken();
    return ok({ token });
  },
});
