import { NextResponse } from "next/server";
import type { ApiFailure, ApiSuccess, PaginationMeta } from "@/types";
import { AppError } from "@/lib/api/errors";

export function ok<T>(data: T, meta?: PaginationMeta, status = 200) {
  const body: ApiSuccess<T> = meta ? { success: true, data, meta } : { success: true, data };
  return NextResponse.json(body, { status });
}

export function created<T>(data: T) {
  return ok(data, undefined, 201);
}

export function fail(
  message: string,
  status = 400,
  code = "BAD_REQUEST",
  details?: unknown,
) {
  const body: ApiFailure = {
    success: false,
    error: { code, message, details },
  };
  return NextResponse.json(body, { status });
}

export function fromError(error: unknown) {
  if (error instanceof AppError) {
    return fail(error.message, error.statusCode, error.code, error.details);
  }

  console.error("[API_ERROR]", error);
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error instanceof Error
        ? error.message
        : "Unknown error";
  return fail(message, 500, "INTERNAL_ERROR");
}
