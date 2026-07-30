import { ZodError } from "zod";

/**
 * Structured logging for audit trail and debugging.
 * In production, pipe to CloudWatch, Datadog, etc.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  userId?: string;
  level: LogLevel;
  timestamp: string;
  message: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

function formatLog(ctx: LogContext): string {
  const prefix = `[${ctx.timestamp}] [${ctx.level.toUpperCase()}]${ctx.requestId ? ` [${ctx.requestId}]` : ""}`;
  const body = ctx.message;
  const extras = [];

  if (ctx.path && ctx.method) extras.push(`${ctx.method} ${ctx.path}`);
  if (ctx.statusCode) extras.push(`status=${ctx.statusCode}`);
  if (ctx.duration) extras.push(`duration=${ctx.duration}ms`);
  if (ctx.userId) extras.push(`userId=${ctx.userId}`);

  if (ctx.error) {
    extras.push(`error="${ctx.error.name}: ${ctx.error.message}"`);
  }

  if (ctx.metadata) {
    extras.push(`metadata=${JSON.stringify(ctx.metadata)}`);
  }

  const extra = extras.length ? ` ${extras.join(" ")}` : "";
  return `${prefix} ${body}${extra}`;
}

export const logger = {
  debug: (message: string, ctx?: Omit<LogContext, "level" | "timestamp" | "message">) =>
    console.debug(formatLog({ level: "debug", timestamp: new Date().toISOString(), message, ...ctx })),

  info: (message: string, ctx?: Omit<LogContext, "level" | "timestamp" | "message">) =>
    console.log(formatLog({ level: "info", timestamp: new Date().toISOString(), message, ...ctx })),

  warn: (message: string, ctx?: Omit<LogContext, "level" | "timestamp" | "message">) =>
    console.warn(formatLog({ level: "warn", timestamp: new Date().toISOString(), message, ...ctx })),

  error: (message: string, err?: Error, ctx?: Omit<LogContext, "level" | "timestamp" | "message" | "error">) =>
    console.error(
      formatLog({
        level: "error",
        timestamp: new Date().toISOString(),
        message,
        error: err ? { name: err.name, message: err.message, stack: err.stack } : undefined,
        ...ctx,
      }),
    ),
};

/**
 * Sanitize error for API response (never expose stack in production).
 */
export function sanitizeError(err: unknown): { message: string; code: string } {
  if (err instanceof ZodError) {
    return {
      code: "VALIDATION_ERROR",
      message: err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
    };
  }

  if (err instanceof Error) {
    const code = (err as unknown as Record<string, unknown>).code || "INTERNAL_ERROR";
    const isDev = process.env.NODE_ENV === "development";
    return {
      code: String(code),
      message: isDev ? err.message : "An error occurred. Please try again.",
    };
  }

  return { code: "INTERNAL_ERROR", message: "An unexpected error occurred." };
}
