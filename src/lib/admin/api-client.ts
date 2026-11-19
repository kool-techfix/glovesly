/*
 * Browser fetch wrapper for /api/**. Success → { data, meta }. Failure →
 * AdminApiError carrying the API's code, message and field details.
 * A 401 from an admin endpoint sends the browser to the login page.
 */

export type ListMeta = { page: number; pageSize: number; total: number; totalPages: number };

export type ApiResult<T> = { data: T; meta?: ListMeta };

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, string | string[]>,
  ) {
    super(message);
    this.name = "AdminApiError";
  }

  /** Field errors keyed by the top-level field name ("capabilities.0" → "capabilities"). */
  fieldErrors(): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const [path, message] of Object.entries(this.details ?? {})) {
      const field = path.split(".")[0] ?? path;
      if (!(field in errors)) errors[field] = Array.isArray(message) ? message.join(" ") : message;
    }
    return errors;
  }

  /** Publish-rule reasons (details.publish), if any. */
  publishProblems(): string[] {
    const publish = this.details?.publish;
    if (!publish) return [];
    return Array.isArray(publish) ? publish : [publish];
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  /** Skip the 401 → login redirect (login and password pages). */
  noAuthRedirect?: boolean;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, query, noAuthRedirect, signal } = options;
  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new AdminApiError(0, "NETWORK_ERROR", "Could not reach the server. Check your connection and try again.");
  }

  const json = (await response.json().catch(() => null)) as
    | { data: T; meta?: ListMeta }
    | { error: { code: string; message: string; details?: Record<string, string | string[]> } }
    | null;

  if (!response.ok || !json || "error" in json) {
    const error = json && "error" in json ? json.error : null;
    if (response.status === 401 && !noAuthRedirect && typeof window !== "undefined") {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      // Full navigation on purpose: drops all client state of the expired session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/admin/login?next=${next}`);
    }
    throw new AdminApiError(
      response.status,
      error?.code ?? "UNKNOWN",
      error?.message ?? `Request failed (${response.status}).`,
      error?.details,
    );
  }
  return json;
}

/** Shorthand returning only `data`. */
export async function api<T>(path: string, options?: RequestOptions): Promise<T> {
  return (await apiRequest<T>(path, options)).data;
}

/** A readable message for toasts. */
export function errorMessage(error: unknown): string {
  if (error instanceof AdminApiError) {
    const problems = error.publishProblems();
    return problems.length ? `${error.message} ${problems.join(" ")}` : error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
