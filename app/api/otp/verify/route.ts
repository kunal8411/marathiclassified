import type { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { attachAuthCookies } from "@/lib/auth/session";
import { otpVerifySchema } from "@/validators";
import { rateLimitKey, createRateLimitResponse } from "@/lib/middleware/rate-limit";
import { logger } from "@/lib/middleware/logging";
import * as authService from "@/services/auth.service";
import * as otpService from "@/services/otp.service";

export const POST = createApiHandler({
  bodySchema: otpVerifySchema,
  handler: async ({ body, req }) => {
    // Rate limiting: 10 attempts per minute per destination
    const limit = rateLimitKey(req as NextRequest, `otp:verify:${body.destination}`);
    if (limit.remaining <= 0) {
      logger.warn("OTP verify rate limit exceeded", { metadata: { destination: body.destination } });
      return createRateLimitResponse(limit) as unknown as ReturnType<typeof ok>;
    }

    if (body.purpose === "register") {
      logger.info("OTP verify for registration", { metadata: { destination: body.destination } });
      const { user, tokens } = await authService.verifyRegistration({
        channel: body.channel,
        destination: body.destination,
        code: body.code,
      });
      logger.info("Registration complete", { metadata: { userId: user.id } });
      return attachAuthCookies(ok(user), tokens);
    }

    await otpService.verifyOtp(body);
    return ok({ verified: true });
  },
});
