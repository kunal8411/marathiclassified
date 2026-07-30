import { type NextRequest, NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import type { SessionUser, UserRole } from "@/types";
import { fromError, fail } from "@/lib/api/response";
import { ForbiddenError, UnauthorizedError, ValidationError } from "@/lib/api/errors";
import { connectDb } from "@/lib/db/connect";
import { getSessionUser } from "@/lib/auth/session";
import { applyCorsHeaders, getAllowedOrigin } from "@/lib/security/cors";
import { sanitizeObject } from "@/lib/security/sanitize";
import { verifyCsrf } from "@/lib/security/csrf";

type HandlerContext<TBody, TQuery> = {
  req: NextRequest;
  params: Record<string, string>;
  body: TBody;
  query: TQuery;
  user: SessionUser | null;
};

type HandlerOptions<TBody, TQuery> = {
  auth?: boolean;
  roles?: UserRole[];
  bodySchema?: ZodSchema<TBody>;
  querySchema?: ZodSchema<TQuery>;
  csrf?: boolean;
  handler: (ctx: HandlerContext<TBody, TQuery>) => Promise<NextResponse>;
};

export function createApiHandler<TBody = unknown, TQuery = unknown>(
  options: HandlerOptions<TBody, TQuery>,
) {
  return async (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    const origin = getAllowedOrigin(req);
    if (req.method === "OPTIONS") {
      const res = new NextResponse(null, { status: 204 });
      return applyCorsHeaders(res, origin);
    }

    try {
      await connectDb();

      const params = (await context?.params) ?? {};
      let user: SessionUser | null = null;

      if (options.auth || options.roles?.length) {
        user = await getSessionUser();
        if (!user) throw new UnauthorizedError();
        if (user.isBanned) throw new ForbiddenError("Account is banned");
        if (options.roles?.length && !options.roles.includes(user.role)) {
          throw new ForbiddenError("Insufficient permissions");
        }
      }

      if (options.csrf && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        await verifyCsrf(req);
      }

      let body = undefined as TBody;
      if (options.bodySchema && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        const json = await req.json().catch(() => ({}));
        const sanitized = sanitizeObject(json);
        const parsed = options.bodySchema.safeParse(sanitized);
        if (!parsed.success) {
          throw new ValidationError("Invalid request body", parsed.error.flatten());
        }
        body = parsed.data;
      }

      let query = undefined as TQuery;
      if (options.querySchema) {
        const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
        const sanitized = sanitizeObject(raw);
        const parsed = options.querySchema.safeParse(sanitized);
        if (!parsed.success) {
          throw new ValidationError("Invalid query parameters", parsed.error.flatten());
        }
        query = parsed.data;
      }

      const response = await options.handler({ req, params, body, query, user });
      return applyCorsHeaders(response, origin);
    } catch (error) {
      return applyCorsHeaders(fromError(error), origin);
    }
  };
}

export function methodNotAllowed() {
  return fail("Method not allowed", 405, "METHOD_NOT_ALLOWED");
}
