// Itinerary response validation (QTR-023).
//
// Single source of truth for checking the JSON returned by
// POST /api/itineraries before the planner form renders it. Pure and
// framework-free, like validatePreferences: the same contract protects the
// route on the server and the form on the client, so an unexpected payload
// never reaches the itinerary view as if it were a real plan.
//
// The validator is a predicate, not a field-by-field report: the form only
// needs to know whether the response is usable, and every rejection surfaces
// as one recoverable error. Unknown values are never coerced — a duration
// that is not a known number is rejected, never treated as zero.

import {
  BUDGET_LEVELS,
  DESTINATION_CATEGORIES,
  EXPERIENCE_CATEGORIES,
  INTERESTS,
  type BudgetLevel,
  type DestinationCategory,
  type Experience,
  type ExperienceCategory,
  type Interest,
} from "../../catalog/domain/types";
import {
  isConfidenceStatus,
  type SourceReference,
} from "../../catalog/domain/confidence";
import type { UnscheduledExperience } from "../../itinerary/domain/distribute-experiences";
import {
  ITINERARY_BLOCK_KINDS,
  type Itinerary,
  type ItineraryBlock,
  type ItineraryBlockKind,
  type ItineraryDay,
} from "./types";
import { STRATEGY_IDS, type StrategyId } from "./select-strategies";

// Lookup sets built once from the const arrays: membership checks stay O(1)
// and the arrays remain the single source of valid values.
const BLOCK_KIND_LOOKUP = new Set<string>(ITINERARY_BLOCK_KINDS);
const DESTINATION_CATEGORY_LOOKUP = new Set<string>(DESTINATION_CATEGORIES);
const EXPERIENCE_CATEGORY_LOOKUP = new Set<string>(EXPERIENCE_CATEGORIES);
const BUDGET_LEVEL_LOOKUP = new Set<string>(BUDGET_LEVELS);
const INTEREST_LOOKUP = new Set<string>(INTERESTS);
const STRATEGY_ID_LOOKUP = new Set<string>(STRATEGY_IDS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item: unknown) => typeof item === "string")
  );
}

function isBlockKind(value: unknown): value is ItineraryBlockKind {
  return typeof value === "string" && BLOCK_KIND_LOOKUP.has(value);
}

function isDestinationCategory(value: unknown): value is DestinationCategory {
  return typeof value === "string" && DESTINATION_CATEGORY_LOOKUP.has(value);
}

function isExperienceCategory(value: unknown): value is ExperienceCategory {
  return typeof value === "string" && EXPERIENCE_CATEGORY_LOOKUP.has(value);
}

function isBudgetLevel(value: unknown): value is BudgetLevel {
  return typeof value === "string" && BUDGET_LEVEL_LOOKUP.has(value);
}

function isStrategyId(value: unknown): value is StrategyId {
  return typeof value === "string" && STRATEGY_ID_LOOKUP.has(value);
}

function isInterestArray(value: unknown): value is Interest[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item: unknown) => typeof item === "string" && INTEREST_LOOKUP.has(item),
    )
  );
}

/** Known durations are finite non-negative numbers (FR-14 semantics). */
function isKnownMinutes(value: unknown): boolean {
  return (
    typeof value === "number" && Number.isFinite(value) && value >= 0
  );
}

function isSourceReference(value: unknown): value is SourceReference {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.sourceName === "string" &&
    (value.sourceUrl === null || typeof value.sourceUrl === "string") &&
    (value.verifiedAt === null || typeof value.verifiedAt === "string")
  );
}

function isExperience(value: unknown): value is Experience {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    typeof value.destinationId === "string" &&
    typeof value.name === "string" &&
    isExperienceCategory(value.category) &&
    isInterestArray(value.interests) &&
    (value.estimatedDurationMinutes === null ||
      isKnownMinutes(value.estimatedDurationMinutes)) &&
    (value.budgetLevel === null || isBudgetLevel(value.budgetLevel)) &&
    typeof value.description === "string" &&
    (value.source === null || isSourceReference(value.source)) &&
    isConfidenceStatus(value.confidence)
  );
}

function isItineraryBlock(value: unknown): value is ItineraryBlock {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    isBlockKind(value.kind) &&
    typeof value.title === "string" &&
    (value.destinationId === null ||
      typeof value.destinationId === "string") &&
    (value.estimatedDurationMinutes === null ||
      isKnownMinutes(value.estimatedDurationMinutes)) &&
    (value.notes === null || typeof value.notes === "string") &&
    (value.source === null || isSourceReference(value.source)) &&
    isConfidenceStatus(value.confidence)
  );
}

function isItineraryDay(value: unknown): value is ItineraryDay {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.dayNumber === "number" &&
    Number.isInteger(value.dayNumber) &&
    (value.destinationCategory === null ||
      isDestinationCategory(value.destinationCategory)) &&
    Array.isArray(value.blocks) &&
    value.blocks.every((block: unknown) => isItineraryBlock(block))
  );
}

function isUnscheduledExperience(
  value: unknown,
): value is UnscheduledExperience {
  if (!isRecord(value)) {
    return false;
  }
  return isExperience(value.experience) && typeof value.reason === "string";
}

function isItinerary(value: unknown): value is Itinerary {
  if (!isRecord(value)) {
    return false;
  }
  return (
    isStrategyId(value.strategyId) &&
    Array.isArray(value.days) &&
    value.days.every((day: unknown) => isItineraryDay(day)) &&
    isStringArray(value.rationale) &&
    isStringArray(value.warnings) &&
    Array.isArray(value.unscheduled) &&
    value.unscheduled.every((item: unknown) => isUnscheduledExperience(item))
  );
}

/**
 * Extracts a usable itinerary from the parsed response of
 * POST /api/itineraries. Anything that does not match the domain contract —
 * including a missing or malformed `itinerary` key — is rejected as `null`,
 * so the caller can surface one recoverable error instead of rendering a
 * partial plan.
 */
export function validateItineraryResponse(payload: unknown): Itinerary | null {
  return isRecord(payload) && isItinerary(payload.itinerary)
    ? payload.itinerary
    : null;
}
