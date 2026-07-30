import type { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { attachAuthCookies } from "@/lib/auth/session";
import { loginSchema } from "@/validators";
import { rateLimitKey, createRateLimitResponse } from "@/lib/middleware/rate-limit";
import { logger } from "@/lib/middleware/logging";
import * as authService from "@/services/auth.service";

export const POST = createApiHandler({
  bodySchema: loginSchema,
  handler: async ({ body, req }) => {
    // Rate limiting: 5 attempts per minute per IP
    const limit = rateLimitKey(req as NextRequest, "auth:login");
    if (limit.remaining <= 0) {
      logger.warn("Login rate limit exceeded", { path: "/api/auth/login", metadata: { ip: limit.key } });
      return createRateLimitResponse(limit) as unknown as ReturnType<typeof ok>;
    }

    logger.info("Login attempt", { metadata: { email: body.email || body.phone } });
    const { user, tokens } = await authService.login(body);
    logger.info("Login success", { metadata: { userId: user.id } });
    return attachAuthCookies(ok(user), tokens);
  },
});
