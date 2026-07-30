import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { registerSchema } from "@/validators";
import * as authService from "@/services/auth.service";

export const POST = createApiHandler({
  bodySchema: registerSchema,
  handler: async ({ body }) => {
    const channel = body.email ? ("email" as const) : ("phone" as const);
    const destination = (body.email ?? body.phone)!;
    const data = await authService.registerStart({
      channel,
      destination,
      name: body.name,
      password: body.password,
      email: body.email,
      phone: body.phone,
    });
    return ok(data);
  },
});
