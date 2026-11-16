import type { ZodError, ZodType, ZodTypeDef } from "zod";

import { ApiError, type ApiErrorDetails } from "@/lib/api/api-error";

/** Maps Zod issues to `{ "field.path": "first message" }`. */
export function zodDetails(error: ZodError): ApiErrorDetails {
  const details: ApiErrorDetails = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_root";
    if (!(key in details)) details[key] = issue.message;
  }
  return details;
}

function parseWith<Output>(schema: ZodType<Output, ZodTypeDef, unknown>, input: unknown): Output {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw ApiError.validation("Some fields are invalid.", zodDetails(result.error));
  }
  return result.data;
}

/** Reads a JSON body and validates it. Bad JSON → 400, invalid fields → 422. */
export async function parseJson<Output>(
  request: Request,
  schema: ZodType<Output, ZodTypeDef, unknown>,
): Promise<Output> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw ApiError.badRequest("The request body must be valid JSON.");
  }
  return parseWith(schema, body);
}

/** Validates the query string. Repeated keys keep the last value. */
export function parseQuery<Output>(
  request: Request,
  schema: ZodType<Output, ZodTypeDef, unknown>,
): Output {
  const params = new URL(request.url).searchParams;
  return parseWith(schema, Object.fromEntries(params.entries()));
}

/** Validates already-resolved route params. */
export function parseParams<Output>(
  params: unknown,
  schema: ZodType<Output, ZodTypeDef, unknown>,
): Output {
  const result = schema.safeParse(params);
  if (!result.success) throw ApiError.notFound();
  return result.data;
}

/** Best-effort client IP for rate limiting (first X-Forwarded-For hop). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function getUserAgent(request: Request): string | null {
  return request.headers.get("user-agent")?.slice(0, 500) ?? null;
}
