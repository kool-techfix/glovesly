export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

/** Field path → message(s). Publish-rule failures use the key "publish". */
export type ApiErrorDetails = Record<string, string | string[]>;

/**
 * An expected error with an HTTP status. Thrown anywhere below a route
 * handler and turned into `{ error: { code, message, details? } }` by handle().
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: ApiErrorDetails;
  readonly headers?: Record<string, string>;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    options: { details?: ApiErrorDetails; headers?: Record<string, string> } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = options.details;
    this.headers = options.headers;
  }

  static badRequest(message = "Bad request.") {
    return new ApiError(400, "BAD_REQUEST", message);
  }

  static unauthorized(message = "You need to sign in.") {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have permission to do that.") {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Not found.") {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static conflict(message: string, details?: ApiErrorDetails) {
    return new ApiError(409, "CONFLICT", message, { details });
  }

  static validation(message = "Some fields are invalid.", details?: ApiErrorDetails) {
    return new ApiError(422, "VALIDATION_ERROR", message, { details });
  }

  static rateLimited(retryAfterSeconds: number) {
    const seconds = Math.max(1, Math.ceil(retryAfterSeconds));
    return new ApiError(429, "RATE_LIMITED", "Too many requests. Please try again later.", {
      headers: { "Retry-After": String(seconds) },
    });
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
