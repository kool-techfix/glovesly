import { ApiError } from "@/lib/api/api-error";

/*
 * In-memory fixed-window limiter. Counters live per server instance, so the
 * limits are per instance too. Move to a shared store (Redis/Upstash) before
 * running more than one instance.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const SWEEP_THRESHOLD = 10_000;

export type RateLimitOptions = { limit: number; windowMs: number };
export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSeconds: number };

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Counts one hit against `key` and reports whether it is within the limit. */
export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  if (buckets.size > SWEEP_THRESHOLD) sweep(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
  return {
    ok: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds,
  };
}

/** Throws a 429 ApiError (with Retry-After) when any of the keys is over its limit. */
export function enforceRateLimit(...checks: Array<[key: string, options: RateLimitOptions]>) {
  let retryAfter = 0;
  for (const [key, options] of checks) {
    const result = rateLimit(key, options);
    if (!result.ok) retryAfter = Math.max(retryAfter, result.retryAfterSeconds);
  }
  if (retryAfter > 0) throw ApiError.rateLimited(retryAfter);
}

/** Clears a key, e.g. after a successful login. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
