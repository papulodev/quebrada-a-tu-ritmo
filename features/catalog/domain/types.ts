// Catalogue domain types.
//
// Pure types and value lists only: no React, no database, no network. These
// shapes mirror the conceptual model in PROJECT_SPEC.md §10 and are the single
// source of truth for the SQL schema (QTR-008) and the seed (QTR-010).

import type { ConfidenceStatus, SourceReference } from "./confidence";

export const DESTINATION_CATEGORIES = [
  "locality",
  "attraction",
  "natural_area",
  "landmark",
] as const;

export type DestinationCategory = (typeof DESTINATION_CATEGORIES)[number];

export const INTERESTS = [
  "archaeology",
  "history",
  "landscape",
  "nature",
  "food",
  "hiking",
  "culture",
  "photography",
  "crafts",
  "wellness",
  "astronomy",
] as const;

export type Interest = (typeof INTERESTS)[number];

export const BUDGET_LEVELS = ["low", "medium", "high"] as const;

export type BudgetLevel = (typeof BUDGET_LEVELS)[number];

export const EXPERIENCE_CATEGORIES = [
  "archaeological_site",
  "viewpoint",
  "walk",
  "historic_center",
  "market",
  "museum",
] as const;

export type ExperienceCategory = (typeof EXPERIENCE_CATEGORIES)[number];

export const TRANSPORT_MODES = [
  "bus",
  "solar_train",
  "guided_excursion",
  "car",
  "walk",
  "mixed",
] as const;

export type TransportMode = (typeof TRANSPORT_MODES)[number];

/** A town or point of interest in the Quebrada and neighbouring areas. */
export interface Destination {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Free-form zone label, e.g. "Quebrada Central". */
  zone: string;
  category: DestinationCategory;
  /** Unknown visit length is `null`, never `0`. */
  estimatedVisitMinutes: number | null;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  source: SourceReference | null;
  confidence: ConfidenceStatus;
}

/** An activity that can be scheduled at a destination. */
export interface Experience {
  id: string;
  destinationId: string;
  name: string;
  category: ExperienceCategory;
  interests: Interest[];
  /** Unknown duration is `null`, never `0`. */
  estimatedDurationMinutes: number | null;
  /** `null` while the cost level has no documented basis. */
  budgetLevel: BudgetLevel | null;
  description: string;
  source: SourceReference | null;
  confidence: ConfidenceStatus;
}

/** A known way of moving between two destinations. */
export interface TransportOption {
  id: string;
  originDestinationId: string;
  destinationDestinationId: string;
  mode: TransportMode;
  /** Unknown travel time is `null`, never `0`. */
  estimatedDurationMinutes: number | null;
  priceMin: number | null;
  priceMax: number | null;
  /** ISO 4217 code, e.g. "ARS". */
  currency: string;
  scheduleNotes: string | null;
  source: SourceReference | null;
  confidence: ConfidenceStatus;
}

export const SOURCE_ENTITY_TYPES = [
  "destination",
  "experience",
  "transport_option",
] as const;

export type SourceEntityType = (typeof SOURCE_ENTITY_TYPES)[number];

/** Free-form note attached to a catalogue entity, with its provenance. */
export interface SourceNote {
  id: string;
  entityType: SourceEntityType;
  entityId: string;
  sourceName: string;
  sourceUrl: string | null;
  checkedAt: string | null;
  note: string;
}
