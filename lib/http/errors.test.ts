import { describe, expect, it } from "vitest";
import { ApiError, errorResponse, jsonError } from "./errors";

describe("errorResponse", () => {
  it("keeps the status, code and message of a known ApiError", () => {
    const result = errorResponse(
      new ApiError(404, "not_found", "Destination not found"),
    );

    expect(result.status).toBe(404);
    expect(result.body).toEqual({
      error: { code: "not_found", message: "Destination not found" },
    });
  });

  it("maps unknown errors to a generic 500 without leaking their message", () => {
    const result = errorResponse(
      new Error("connect ECONNREFUSED postgres://user:hunter2@host"),
    );

    expect(result.status).toBe(500);
    expect(result.body.error.code).toBe("internal_error");
    expect(JSON.stringify(result.body)).not.toContain("hunter2");
    expect(result.body.error.message).not.toContain("ECONNREFUSED");
  });

  it("handles thrown values that are not Error instances", () => {
    const thrownValues: unknown[] = ["boom", 42, null, undefined, { secret: "hunter2" }];

    for (const thrown of thrownValues) {
      const result = errorResponse(thrown);

      expect(result.status).toBe(500);
      expect(result.body.error.code).toBe("internal_error");
      expect(JSON.stringify(result.body)).not.toContain("hunter2");
    }
  });

  it("does not expose the cause chain of an unknown error", () => {
    const error = new Error("query failed", {
      cause: new Error("password=hunter2"),
    });

    expect(JSON.stringify(errorResponse(error).body)).not.toContain("hunter2");
  });
});

describe("jsonError", () => {
  it("serializes the envelope with the HTTP status", async () => {
    const response = jsonError(
      new ApiError(400, "invalid_input", "days must be positive"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: { code: "invalid_input", message: "days must be positive" },
    });
  });
});
