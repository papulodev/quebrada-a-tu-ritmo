// Shared HTTP error envelope.
//
// Route Handlers answer every failure with the same shape:
//   { "error": { "code": "<stable code>", "message": "<safe message>" } }
//
// Only an explicit `ApiError` keeps its message. Anything else is treated as an
// internal failure, so database errors, connection strings and stack details
// never reach the client.

export type ApiErrorCode =
  | "invalid_input"
  | "not_found"
  | "conflict"
  | "internal_error";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}

export interface ErrorResult {
  status: number;
  body: ApiErrorBody;
}

const INTERNAL_MESSAGE = "Unexpected error. Try again later.";

/** An error whose message is safe to expose to the client. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Maps any thrown value to a status and a safe response body. */
export function errorResponse(error: unknown): ErrorResult {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: { error: { code: error.code, message: error.message } },
    };
  }

  return {
    status: 500,
    body: { error: { code: "internal_error", message: INTERNAL_MESSAGE } },
  };
}

/** Convenience wrapper for Route Handlers, which return a `Response`. */
export function jsonError(error: unknown): Response {
  const { status, body } = errorResponse(error);

  return Response.json(body, { status });
}
