import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError } from "@/lib/api/api-error";
import { zodDetails } from "@/lib/api/request";

export type PageMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function pageMeta(page: number, pageSize: number, total: number): PageMeta {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

/** Success shape: `{ data, meta? }`. */
export function ok<T>(
  data: T,
  init: { status?: number; meta?: PageMeta | Record<string, unknown>; headers?: HeadersInit } = {},
) {
  const body = init.meta === undefined ? { data } : { data, meta: init.meta };
  return NextResponse.json(body, { status: init.status ?? 200, headers: init.headers });
}

/** Error shape: `{ error: { code, message, details? } }`. */
export function fail(error: ApiError) {
  const body = {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  };
  return NextResponse.json(body, { status: error.status, headers: error.headers });
}

/**
 * Wraps a route handler body. ApiError and ZodError become their error
 * shapes; anything else is logged and returned as a generic 500 (the real
 * message is included outside production only).
 */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ApiError) return fail(error);
    if (error instanceof ZodError) {
      return fail(ApiError.validation("Some fields are invalid.", zodDetails(error)));
    }

    console.error("[api] Unhandled error", error);
    const message =
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return fail(new ApiError(500, "INTERNAL_ERROR", message));
  }
}
