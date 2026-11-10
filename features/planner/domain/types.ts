// Planner domain types.
//
// Pure types only: no React, no database, no network. They describe the input
// (travel preferences), the comparison output (strategies) and the itinerary,
// so the planning engine can be tested without rendering anything.

import type {
  BudgetLevel,
  DestinationCategory,
  Interest,
  TransportMode,
} from "../../catalog/domain/types";
import type { ConfidenceStatus } from "../../catalog/domain/confidence";
import type { StrategyId } from "./select-strategies";

export const ORIGIN_KINDS = [
  "salta",
  "san_salvador_de_jujuy",
  "quebrada_locality",
  "other",
] as const;

export type OriginKind = (typeof ORIGIN_KINDS)[number];

/**
 * Where the trip starts. A Quebrada locality must point at a catalogue
 * destination; "other" covers origins the catalogue cannot name yet.
 */
export type Origin =
  | { kind: "salta" }
  | { kind: "san_salvador_de_jujuy" }
  | { kind: "quebrada_locality"; destinationId: string }
  | { kind: "other" };

export const MOBILITIES = [
  "without_car",
  "own_car",
  "guided_excursions",
  "solar_train",
  "mixed",
] as const;

export type Mobility = (typeof MOBILITIES)[number];

/**
 * Whether the traveller already booked a base. When `decided` is true the
 * destination may still be unknown (`destinationId: null`), which must surface
 * as a warning instead of being treated as "no base".
 */
export type LodgingBase =
  | { decided: false }
  | { decided: true; destinationId: string | null };

export const PACES = ["relaxed", "balanced", "intensive"] as const;

export type Pace = (typeof PACES)[number];

export interface TravelPreferences {
  days: number;
  origin: Origin;
  mobility: Mobility;
  lodging: LodgingBase;
  budget: BudgetLevel;
  interests: Interest[];
  pace: Pace;
}

/** One comparable travel strategy shown in the comparison view (QTR-013). */
export interface TravelStrategy {
  id: string;
  name: string;
  summary: string;
  /** Who this strategy fits, in plain language. */
  fits: string[];
  advantages: string[];
  limitations: string[];
  /** Transport modes the strategy relies on. */
  logistics: TransportMode[];
  confidence: ConfidenceStatus;
  /** Visible caveats: unknown schedules, missing data, dependencies. */
  warnings: string[];
}

export const ITINERARY_BLOCK_KINDS = [
  "visit",
  "transfer",
  "meal",
  "rest",
] as const;

export type ItineraryBlockKind = (typeof ITINERARY_BLOCK_KINDS)[number];

export interface ItineraryBlock {
  id: string;
  kind: ItineraryBlockKind;
  title: string;
  /** `null` for blocks not tied to a single catalogue destination. */
  destinationId: string | null;
  /** Unknown duration is `null`, never `0`. */
  estimatedDurationMinutes: number | null;
  /** Transfer or logistics notes, when data exists. */
  notes: string | null;
  confidence: ConfidenceStatus;
}

export interface ItineraryDay {
  dayNumber: number;
  destinationCategory: DestinationCategory | null;
  blocks: ItineraryBlock[];
}

export interface Itinerary {
  /** Strategy the itinerary was generated for (echoed from the request). */
  strategyId: StrategyId;
  days: ItineraryDay[];
  /** Why certain places were prioritised or discarded (FR-16). */
  rationale: string[];
  warnings: string[];
}
