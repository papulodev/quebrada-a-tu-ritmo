// Travel preferences validation.
//
// Single source of truth for validating planner input on the server (QTR-014)
// and in the planner form (QTR-015). Pure and framework-free: no React, no
// database, no network, so it can be tested without rendering anything.
//
// The validator never trusts the incoming shape: it walks the raw value, builds
// a clean `TravelPreferences` field by field (dropping unknown keys) and reports
// every problem with the path of the field that needs correction.

import {
  BUDGET_LEVELS,
  INTERESTS,
  type BudgetLevel,
  type Interest,
} from "../../catalog/domain/types";
import {
  MOBILITIES,
  ORIGIN_KINDS,
  PACES,
  type LodgingBase,
  type Mobility,
  type Origin,
  type Pace,
  type TravelPreferences,
} from "./types";

/**
 * Trip length accepted by the planner form. FR-02 leaves the concrete limit to
 * the form; these bounds keep the contract explicit and testable.
 */
export const TRIP_DAY_LIMITS = { min: 1, max: 30 } as const;

export interface PreferenceIssue {
  /** Dotted path of the field to fix, e.g. "days" or "interests.0". */
  field: string;
  message: string;
}

export type PreferencesValidation =
  | { ok: true; value: TravelPreferences }
  | { ok: false; issues: PreferenceIssue[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(
  allowed: readonly T[],
  value: unknown,
): value is T {
  return allowed.some((allowedValue) => allowedValue === value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateDays(
  value: unknown,
  issues: PreferenceIssue[],
): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    issues.push({
      field: "days",
      message: "Indique la cantidad de días como número entero.",
    });
    return undefined;
  }

  if (value < TRIP_DAY_LIMITS.min || value > TRIP_DAY_LIMITS.max) {
    issues.push({
      field: "days",
      message: `Indique entre ${TRIP_DAY_LIMITS.min} y ${TRIP_DAY_LIMITS.max} días.`,
    });
    return undefined;
  }

  return value;
}

function validateOrigin(
  value: unknown,
  issues: PreferenceIssue[],
): Origin | undefined {
  if (!isRecord(value)) {
    issues.push({
      field: "origin",
      message: "Indique desde dónde empieza el viaje.",
    });
    return undefined;
  }

  const kind = value.kind;
  if (!isOneOf(ORIGIN_KINDS, kind)) {
    issues.push({
      field: "origin.kind",
      message: "Elija un origen válido.",
    });
    return undefined;
  }

  switch (kind) {
    case "quebrada_locality": {
      const destinationId = value.destinationId;
      if (!isNonEmptyString(destinationId)) {
        issues.push({
          field: "origin.destinationId",
          message: "Indique la localidad de origen.",
        });
        return undefined;
      }
      return { kind: "quebrada_locality", destinationId };
    }
    case "salta":
      return { kind: "salta" };
    case "san_salvador_de_jujuy":
      return { kind: "san_salvador_de_jujuy" };
    case "other":
      return { kind: "other" };
  }
}

function validateChoice<T extends string>(
  field: string,
  allowed: readonly T[],
  value: unknown,
  message: string,
  issues: PreferenceIssue[],
): T | undefined {
  if (!isOneOf(allowed, value)) {
    issues.push({ field, message });
    return undefined;
  }
  return value;
}

function validateLodging(
  value: unknown,
  issues: PreferenceIssue[],
): LodgingBase | undefined {
  if (!isRecord(value)) {
    issues.push({
      field: "lodging",
      message: "Indique si ya eligió una base para dormir.",
    });
    return undefined;
  }

  if (typeof value.decided !== "boolean") {
    issues.push({
      field: "lodging.decided",
      message: "Indique si ya eligió una base para dormir.",
    });
    return undefined;
  }

  if (!value.decided) {
    return { decided: false };
  }

  const destinationId = value.destinationId;
  if (destinationId === undefined || destinationId === null) {
    return { decided: true, destinationId: null };
  }
  if (typeof destinationId === "string" && destinationId.trim() === "") {
    return { decided: true, destinationId: null };
  }
  if (!isNonEmptyString(destinationId)) {
    issues.push({
      field: "lodging.destinationId",
      message: "La base indicada no es válida.",
    });
    return undefined;
  }

  return { decided: true, destinationId };
}

function validateInterests(
  value: unknown,
  issues: PreferenceIssue[],
): Interest[] | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    issues.push({
      field: "interests",
      message: "Elija al menos un interés.",
    });
    return undefined;
  }

  const interests: Interest[] = [];
  let valid = true;

  value.forEach((entry, index) => {
    if (!isOneOf(INTERESTS, entry)) {
      issues.push({
        field: `interests.${index}`,
        message: "El interés indicado no es válido.",
      });
      valid = false;
      return;
    }
    if (!interests.includes(entry)) {
      interests.push(entry);
    }
  });

  return valid ? interests : undefined;
}

export function validatePreferences(input: unknown): PreferencesValidation {
  if (!isRecord(input)) {
    return {
      ok: false,
      issues: [
        {
          field: "preferences",
          message: "Se esperaba un objeto de preferencias.",
        },
      ],
    };
  }

  const issues: PreferenceIssue[] = [];

  const days = validateDays(input.days, issues);
  const origin = validateOrigin(input.origin, issues);
  const mobility = validateChoice(
    "mobility",
    MOBILITIES,
    input.mobility,
    "Elija una forma de movilidad válida.",
    issues,
  );
  const lodging = validateLodging(input.lodging, issues);
  const budget = validateChoice(
    "budget",
    BUDGET_LEVELS,
    input.budget,
    "Elija un presupuesto válido.",
    issues,
  );
  const interests = validateInterests(input.interests, issues);
  const pace = validateChoice(
    "pace",
    PACES,
    input.pace,
    "Elija un ritmo válido.",
    issues,
  );

  if (
    days === undefined ||
    origin === undefined ||
    mobility === undefined ||
    lodging === undefined ||
    budget === undefined ||
    interests === undefined ||
    pace === undefined
  ) {
    return { ok: false, issues };
  }

  const value: TravelPreferences = {
    days,
    origin,
    mobility: mobility satisfies Mobility,
    lodging,
    budget: budget satisfies BudgetLevel,
    interests,
    pace: pace satisfies Pace,
  };

  return { ok: true, value };
}
