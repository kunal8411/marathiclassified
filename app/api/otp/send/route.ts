import type { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { otpSendSchema } from "@/validators";
import { rateLimitKey, createRateLimitResponse } from "@/lib/middleware/rate-limit";
import { logger } from "@/lib/middleware/logging";
import * as otpService from "@/services/otp.service";

export const POST = createApiHandler({
  bodySchema: otpSendSchema,
  handler: async ({ body, req }) => {
    // Rate limiting: 5 attempts per minute per destination
    const limit = rateLimitKey(req as NextRequest, `otp:send:${body.destination}`);
    if (limit.remaining <= 0) {
      logger.warn("OTP send rate limit exceeded", { metadata: { destination: body.destination } });
      return createRateLimitResponse(limit) as unknown as ReturnType<typeof ok>;
    }

    const { name, password, ...otpInput } = body;
    logger.info("OTP send request", { metadata: { destination: body.destination, purpose: body.purpose } });
    const meta =
      name || password
        ? {
            ...(name ? { name } : {}),
            ...(password ? { password } : {}),
          }
        : undefined;
    const data = await otpService.sendOtp({ ...otpInput, meta });
    return ok(data);
  },
});
