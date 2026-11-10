// Itinerary composition (QTR-021).
//
// Pure domain logic: no React, no database, no network. generateItinerary runs
// the whole engine for one request: it ranks the catalogue experiences
// (QTR-017), distributes them across the travel days (QTR-018, QTR-019) and
// explains the result (QTR-020), then composes the final Itinerary the API
// returns. The strategy does not change the plan yet; it is validated and
// echoed so the caller can map the itinerary back to the comparison view.
//
// Honesty rules: an empty catalogue still produces a valid itinerary covering
// the whole trip, with an explicit warning instead of an invented plan
// (FR-10). Distribution warnings and unscheduled reasons are surfaced
// verbatim so the response cannot contradict the engine's own data (FR-21).

import type {
  Destination,
  Experience,
  TransportOption,
} from "../../catalog/domain/types";
import {
  STRATEGY_IDS,
  type StrategyId,
} from "../../planner/domain/select-strategies";
import type {
  Itinerary,
  TravelPreferences,
} from "../../planner/domain/types";
import { buildRationale } from "./build-rationale";
import { distributeExperiences } from "./distribute-experiences";
import { rankExperiences } from "./rank-experiences";

/** Shown when the catalogue has no experiences to schedule (QTR-021). */
export const EMPTY_CATALOG_WARNING =
  "El catálogo no tiene experiencias disponibles, por lo que el itinerario quedó sin actividades.";

/** Catalogue slices the engine needs to compose one itinerary. */
export interface ItineraryCatalog {
  destinations: readonly Destination[];
  experiences: readonly Experience[];
  transportOptions: readonly TransportOption[];
}

export interface GenerateItineraryInput {
  strategyId: StrategyId;
  preferences: TravelPreferences;
  catalog: ItineraryCatalog;
}

/**
 * Composes the final itinerary for an already validated request (QTR-021).
 * Preferences must pass validatePreferences (QTR-011) and the strategy must be
 * one of STRATEGY_IDS.
 */
export function generateItinerary({
  strategyId,
  preferences,
  catalog,
}: GenerateItineraryInput): Itinerary {
  // The endpoint validates the strategy; this guard keeps the failure explicit
  // for any other caller instead of trusting a cast.
  if (!STRATEGY_IDS.some((id) => id === strategyId)) {
    throw new RangeError(
      `generateItinerary requires a known strategy id (received ${strategyId}). Validate the request first (QTR-021).`,
    );
  }

  const ranking = rankExperiences(
    preferences,
    catalog.experiences,
    catalog.destinations,
  );
  const distribution = distributeExperiences(
    preferences,
    ranking,
    catalog.destinations,
    catalog.transportOptions,
  );

  const warnings: string[] = [
    ...distribution.warnings,
    ...distribution.unscheduled.map(({ reason }) => reason),
  ];

  if (catalog.experiences.length === 0) {
    warnings.push(EMPTY_CATALOG_WARNING);
  }

  return {
    strategyId,
    days: distribution.days,
    rationale: buildRationale({ preferences, ranking, distribution }),
    warnings,
    // Ranked experiences that did not fit any day, shown as options (QTR-022).
    unscheduled: distribution.unscheduled,
  };
}
