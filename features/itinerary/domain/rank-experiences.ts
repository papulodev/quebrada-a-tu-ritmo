// Experience ranking (QTR-017).
//
// Pure and framework-free: receives validated travel preferences and the
// catalogue slices it needs, and orders the experiences by how well they
// match the traveller (FR-15). No React, no database, no network, so the
// itinerary engine can reuse it without rendering anything.
//
// Scores only order the list; the itinerary builder distributes the results
// across days later (QTR-018), and pace is handled there, not here. Each
// weight encodes a plain-language rule:
// - every interest shared with the traveller adds 3;
// - an experience at the destination chosen as lodging base adds 2;
// - an experience whose cost level is above the traveller's budget loses 2.
//
// Honesty rules: unknown durations, unknown cost levels or missing sources
// never exclude an experience and never count as zero. A cost level above
// the budget is a penalty, not a removal, because cost levels are
// approximations. Only two catalogue-level conditions are hard exclusions,
// and each one carries an explicit reason the UI can show (FR-16):
// a destination that cannot be resolved in the provided array, and a
// destination marked inactive.

import type {
  BudgetLevel,
  Destination,
  Experience,
  Interest,
} from "../../catalog/domain/types";
import type { TravelPreferences } from "../../planner/domain/types";

/** An experience kept in the ranking, with the interests that matched. */
export interface ScoredExperience {
  experience: Experience;
  score: number;
  matchedInterests: Interest[];
}

/** An experience left out of the ranking, with a traveller-facing reason. */
export interface ExcludedExperience {
  experience: Experience;
  reason: string;
}

export interface ExperienceRanking {
  included: ScoredExperience[];
  excluded: ExcludedExperience[];
}

const INTEREST_MATCH_WEIGHT = 3;
const LODGING_BASE_WEIGHT = 2;
const BUDGET_MISMATCH_PENALTY = -2;

/** Ordinal position of each budget level; higher means more expensive. */
const BUDGET_WEIGHT: Record<BudgetLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

/** True when the traveller decided a base and it is this destination. */
function hasBaseAt(
  preferences: TravelPreferences,
  destinationId: string,
): boolean {
  return (
    preferences.lodging.decided &&
    preferences.lodging.destinationId === destinationId
  );
}

/**
 * True when the experience's cost level is documented and sits above the
 * traveller's budget. A `null` level has no documented basis, so it never
 * counts as a mismatch.
 */
function isAboveTravellerBudget(
  experienceBudget: BudgetLevel | null,
  travellerBudget: BudgetLevel,
): boolean {
  return (
    experienceBudget !== null &&
    BUDGET_WEIGHT[experienceBudget] > BUDGET_WEIGHT[travellerBudget]
  );
}

/**
 * Orders the catalogue experiences by affinity with the traveller (FR-15).
 * Preferences must be already validated (QTR-011). Unknown logistics never
 * exclude an experience; hard exclusions carry a reason the UI can show
 * (FR-16). Ties keep the declaration order so the result is deterministic.
 */
export function rankExperiences(
  preferences: TravelPreferences,
  experiences: readonly Experience[],
  destinations: readonly Destination[],
): ExperienceRanking {
  const destinationById = new Map(
    destinations.map((destination) => [destination.id, destination]),
  );

  const included: (ScoredExperience & { declarationIndex: number })[] = [];
  const excluded: ExcludedExperience[] = [];

  experiences.forEach((experience, declarationIndex) => {
    const destination = destinationById.get(experience.destinationId);

    // Excluding an unresolved destination is deliberate: an experience we
    // cannot place would push unusable rows into the itinerary builder
    // (QTR-018). The reason is explicit, so this is not a silent discard.
    if (!destination) {
      excluded.push({
        experience,
        reason: `No se puede incluir ${experience.name} porque su destino no está en el catálogo.`,
      });
      return;
    }

    if (!destination.active) {
      excluded.push({
        experience,
        reason: `No se puede incluir ${experience.name} porque ${destination.name} no está activo en el catálogo.`,
      });
      return;
    }

    const matchedInterests = experience.interests.filter((interest) =>
      preferences.interests.includes(interest),
    );

    let score = matchedInterests.length * INTEREST_MATCH_WEIGHT;

    if (hasBaseAt(preferences, destination.id)) {
      score += LODGING_BASE_WEIGHT;
    }

    if (isAboveTravellerBudget(experience.budgetLevel, preferences.budget)) {
      score += BUDGET_MISMATCH_PENALTY;
    }

    included.push({ experience, score, matchedInterests, declarationIndex });
  });

  included.sort(
    (left, right) =>
      right.score - left.score ||
      left.declarationIndex - right.declarationIndex,
  );

  return {
    included: included.map(({ experience, score, matchedInterests }) => ({
      experience,
      score,
      matchedInterests,
    })),
    excluded,
  };
}
