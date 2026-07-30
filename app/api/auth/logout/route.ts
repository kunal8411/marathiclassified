import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { clearAuthCookiesOnResponse } from "@/lib/auth/session";
import * as authService from "@/services/auth.service";

export const POST = createApiHandler({
  auth: true,
  handler: async () => {
    await authService.logout();
    return clearAuthCookiesOnResponse(ok({ loggedOut: true as const }));
  },
});
