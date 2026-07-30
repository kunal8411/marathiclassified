import mongoSanitize from "express-mongo-sanitize";

export function sanitizeObject<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input !== "object") return input;
  return mongoSanitize.sanitize(input as Record<string, unknown>, {
    replaceWith: "_",
  }) as T;
}
