// Strategy comparison endpoint tests (QTR-014).
//
// The route is a thin server boundary over the pure domain engine, so these
// tests cover the contract the browser depends on: a valid request returns
// every candidate strategy, and every failure keeps the shared error envelope
// without leaking internal details.

import { afterEach, describe, expect, it, vi } from "vitest";

import type { TravelPreferences } from "../../../features/planner/domain/types";
import { STRATEGY_IDS } from "../../../features/planner/domain/select-strategies";

import { POST } from "./route";

/**
 * Mutable switch shared with the mocked engine. `vi.hoisted` runs before the
 * module factory, so the mock can read the flag on every call while each test
 * decides whether the engine succeeds or throws.
 */
const failures = vi.hoisted(
  (): { internalError: Error | null } => ({ internalError: null }),
);

vi.mock(
  "../../../features/planner/domain/select-strategies",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../features/planner/domain/select-strategies")
      >();

    return {
      ...actual,
      selectStrategies: (...args: Parameters<typeof actual.selectStrategies>) => {
        if (failures.internalError !== null) {
          throw failures.internalError;
        }

        return actual.selectStrategies(...args);
      },
    };
  },
);

const validPreferences: TravelPreferences = {
  days: 3,
  origin: { kind: "salta" },
  mobility: "without_car",
  lodging: { decided: false },
  budget: "medium",
  interests: ["landscape", "history"],
  pace: "balanced",
};

function compareRequest(body: string): Request {
  return new Request("http://localhost/api/compare", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

afterEach(() => {
  failures.internalError = null;
});

describe("POST /api/compare", () => {
  it("returns every candidate strategy for valid preferences", async () => {
    const response = await POST(compareRequest(JSON.stringify(validPreferences)));

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.strategies).toHaveLength(STRATEGY_IDS.length);

    const ids = body.strategies.map((strategy: { id: string }) => strategy.id);
    expect(ids.sort()).toEqual([...STRATEGY_IDS].sort());
  });

  it("rejects preferences that fail server-side validation", async () => {
    const response = await POST(
      compareRequest(JSON.stringify({ ...validPreferences, days: 0 })),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: { code: "invalid_input", message: expect.any(String) },
    });
  });

  it("rejects a body that is not valid JSON", async () => {
    const response = await POST(compareRequest("{"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "invalid_input",
        message: "El cuerpo de la solicitud debe ser JSON válido.",
      },
    });
  });

  it("hides internal failure details behind the shared envelope", async () => {
    failures.internalError = new Error(
      "connect ECONNREFUSED 127.0.0.1:5432 password=supersecret",
    );

    const response = await POST(compareRequest(JSON.stringify(validPreferences)));

    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error.code).toBe("internal_error");

    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("ECONNREFUSED");
    expect(serialized).not.toContain("supersecret");
  });
});
