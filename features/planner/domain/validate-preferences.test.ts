import { describe, expect, it } from "vitest";
import type { TravelPreferences } from "./types";
import {
  TRIP_DAY_LIMITS,
  validatePreferences,
  type PreferenceIssue,
  type PreferencesValidation,
} from "./validate-preferences";

function expectValid(result: PreferencesValidation): TravelPreferences {
  if (!result.ok) {
    throw new Error(
      `Expected valid preferences, got issues: ${JSON.stringify(result.issues)}`,
    );
  }
  return result.value;
}

function expectInvalid(result: PreferencesValidation): PreferenceIssue[] {
  if (result.ok) {
    throw new Error("Expected invalid preferences, but validation passed.");
  }
  return result.issues;
}

function fieldsOf(issues: PreferenceIssue[]): string[] {
  return issues.map((issue) => issue.field);
}

const validInput: Record<string, unknown> = {
  days: 3,
  origin: { kind: "salta" },
  mobility: "without_car",
  lodging: { decided: false },
  budget: "medium",
  interests: ["landscape", "history"],
  pace: "balanced",
};

describe("validatePreferences", () => {
  it("accepts a complete set of preferences", () => {
    const value = expectValid(validatePreferences(validInput));

    expect(value).toEqual(validInput);
  });

  it("drops keys that are not part of the contract", () => {
    const value = expectValid(
      validatePreferences({ ...validInput, unexpected: "ignored" }),
    );

    expect(value).not.toHaveProperty("unexpected");
  });

  it.each([
    ["null", null],
    ["an array", []],
    ["a string", "preferences"],
    ["a number", 42],
    ["undefined", undefined],
  ])("rejects %s as the payload", (_label, input) => {
    const issues = expectInvalid(validatePreferences(input));

    expect(fieldsOf(issues)).toEqual(["preferences"]);
  });
});

describe("trip length", () => {
  it.each([TRIP_DAY_LIMITS.min, TRIP_DAY_LIMITS.max])(
    "accepts %i days",
    (days) => {
      const value = expectValid(validatePreferences({ ...validInput, days }));

      expect(value.days).toBe(days);
    },
  );

  it.each([TRIP_DAY_LIMITS.min - 1, TRIP_DAY_LIMITS.max + 1])(
    "rejects %i days as out of range",
    (days) => {
      const issues = expectInvalid(validatePreferences({ ...validInput, days }));

      expect(fieldsOf(issues)).toEqual(["days"]);
    },
  );

  it.each([2.5, "3", null, undefined])(
    "rejects %s as a trip length",
    (days) => {
      const issues = expectInvalid(validatePreferences({ ...validInput, days }));

      expect(fieldsOf(issues)).toEqual(["days"]);
    },
  );
});

describe("origin", () => {
  it("accepts a Quebrada locality that points at the catalogue", () => {
    const value = expectValid(
      validatePreferences({
        ...validInput,
        origin: { kind: "quebrada_locality", destinationId: "dest-tilcara" },
      }),
    );

    expect(value.origin).toEqual({
      kind: "quebrada_locality",
      destinationId: "dest-tilcara",
    });
  });

  it("requires a destination for a Quebrada locality origin", () => {
    const invalidDestinations: unknown[] = [undefined, null, "", "   ", 42];

    for (const destinationId of invalidDestinations) {
      const issues = expectInvalid(
        validatePreferences({
          ...validInput,
          origin: { kind: "quebrada_locality", destinationId },
        }),
      );

      expect(fieldsOf(issues)).toEqual(["origin.destinationId"]);
    }
  });

  it("rejects an unknown origin kind", () => {
    const issues = expectInvalid(
      validatePreferences({
        ...validInput,
        origin: { kind: "marte" },
      }),
    );

    expect(fieldsOf(issues)).toEqual(["origin.kind"]);
  });

  it("requires an origin object", () => {
    for (const origin of [undefined, null, "salta"]) {
      const issues = expectInvalid(
        validatePreferences({ ...validInput, origin }),
      );

      expect(fieldsOf(issues)).toEqual(["origin"]);
    }
  });

  it("keeps only the fields that belong to the chosen origin", () => {
    const value = expectValid(
      validatePreferences({
        ...validInput,
        origin: { kind: "salta", destinationId: "dest-tilcara" },
      }),
    );

    expect(value.origin).toEqual({ kind: "salta" });
  });
});

describe("mobility, budget and pace", () => {
  it("rejects an unknown mobility", () => {
    const issues = expectInvalid(
      validatePreferences({ ...validInput, mobility: "teleport" }),
    );

    expect(fieldsOf(issues)).toEqual(["mobility"]);
  });

  it("rejects an unknown budget level", () => {
    const issues = expectInvalid(
      validatePreferences({ ...validInput, budget: "unlimited" }),
    );

    expect(fieldsOf(issues)).toEqual(["budget"]);
  });

  it("rejects an unknown pace", () => {
    const issues = expectInvalid(
      validatePreferences({ ...validInput, pace: "fast" }),
    );

    expect(fieldsOf(issues)).toEqual(["pace"]);
  });
});

describe("lodging base", () => {
  it("accepts an already-decided base with a known place", () => {
    const value = expectValid(
      validatePreferences({
        ...validInput,
        lodging: { decided: true, destinationId: "dest-tilcara" },
      }),
    );

    expect(value.lodging).toEqual({
      decided: true,
      destinationId: "dest-tilcara",
    });
  });

  it("normalizes an undecided base place to null", () => {
    const undecidedPlaces: unknown[] = [undefined, null, "", "   "];

    for (const destinationId of undecidedPlaces) {
      const value = expectValid(
        validatePreferences({
          ...validInput,
          lodging: { decided: true, destinationId },
        }),
      );

      expect(value.lodging).toEqual({ decided: true, destinationId: null });
    }
  });

  it("rejects a base place that is not a string or null", () => {
    const issues = expectInvalid(
      validatePreferences({
        ...validInput,
        lodging: { decided: true, destinationId: 42 },
      }),
    );

    expect(fieldsOf(issues)).toEqual(["lodging.destinationId"]);
  });

  it("rejects a non-boolean decision", () => {
    const issues = expectInvalid(
      validatePreferences({
        ...validInput,
        lodging: { decided: "yes" },
      }),
    );

    expect(fieldsOf(issues)).toEqual(["lodging.decided"]);
  });

  it("requires a lodging object", () => {
    for (const lodging of [undefined, null, "tilcara"]) {
      const issues = expectInvalid(
        validatePreferences({ ...validInput, lodging }),
      );

      expect(fieldsOf(issues)).toEqual(["lodging"]);
    }
  });
});

describe("interests", () => {
  it("requires at least one interest", () => {
    for (const interests of [[], undefined, "landscape"]) {
      const issues = expectInvalid(
        validatePreferences({ ...validInput, interests }),
      );

      expect(fieldsOf(issues)).toEqual(["interests"]);
    }
  });

  it("reports the index of an unknown interest", () => {
    const issues = expectInvalid(
      validatePreferences({
        ...validInput,
        interests: ["landscape", "party"],
      }),
    );

    expect(fieldsOf(issues)).toEqual(["interests.1"]);
  });

  it("removes duplicates while keeping the original order", () => {
    const value = expectValid(
      validatePreferences({
        ...validInput,
        interests: ["landscape", "landscape", "history"],
      }),
    );

    expect(value.interests).toEqual(["landscape", "history"]);
  });
});

describe("issue reporting", () => {
  it("collects every problem in field order", () => {
    const issues = expectInvalid(
      validatePreferences({
        ...validInput,
        days: 0,
        mobility: "teleport",
        pace: "fast",
      }),
    );

    expect(fieldsOf(issues)).toEqual(["days", "mobility", "pace"]);
  });

  it("describes each issue with a message", () => {
    const issues = expectInvalid(
      validatePreferences({ ...validInput, budget: "unlimited" }),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message.length).toBeGreaterThan(0);
  });
});
