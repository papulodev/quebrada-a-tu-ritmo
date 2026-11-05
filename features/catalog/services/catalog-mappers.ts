// Row shapes and mappers between PostgreSQL and the catalogue domain types.
//
// Rows arrive already normalised by SQL casts (`::float8`, `::text`), so these
// functions only rename columns and validate the columns that the database
// constrains with CHECK: an unexpected value means the schema and the domain
// types drifted apart, and that should fail loudly instead of reaching the UI.

import { isConfidenceStatus, type ConfidenceStatus, type SourceReference } from "../domain/confidence";
import {
  BUDGET_LEVELS,
  DESTINATION_CATEGORIES,
  EXPERIENCE_CATEGORIES,
  INTERESTS,
  TRANSPORT_MODES,
  type BudgetLevel,
  type Destination,
  type DestinationCategory,
  type Experience,
  type ExperienceCategory,
  type Interest,
  type TransportMode,
  type TransportOption,
} from "../domain/types";

export class InvalidCatalogueRowError extends Error {
  constructor(entity: string, id: string, field: string, value: unknown) {
    super(
      `Invalid catalogue row ${entity}/${id}: unexpected ${field} ${JSON.stringify(value)}.`,
    );
    this.name = "InvalidCatalogueRowError";
  }
}

function pick<T extends string>(
  entity: string,
  id: string,
  field: string,
  allowed: readonly T[],
  value: string,
): T {
  if ((allowed as readonly string[]).includes(value)) {
    return value as T;
  }

  throw new InvalidCatalogueRowError(entity, id, field, value);
}

function toConfidence(entity: string, id: string, value: string): ConfidenceStatus {
  if (isConfidenceStatus(value)) {
    return value;
  }

  throw new InvalidCatalogueRowError(entity, id, "confidence_status", value);
}

function toSource(
  name: string | null,
  url: string | null,
  verifiedAt: string | null,
): SourceReference | null {
  if (name === null) {
    return null;
  }

  return { sourceName: name, sourceUrl: url, verifiedAt };
}

export interface DestinationRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  zone: string;
  category: string;
  estimated_visit_minutes: number | null;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  source_name: string | null;
  source_url: string | null;
  source_verified_at: string | null;
  confidence_status: string;
}

export interface ExperienceRow {
  id: string;
  destination_id: string;
  name: string;
  category: string;
  interests: string[];
  estimated_duration_minutes: number | null;
  budget_level: string | null;
  description: string;
  source_name: string | null;
  source_url: string | null;
  source_verified_at: string | null;
  confidence_status: string;
}

export interface TransportOptionRow {
  id: string;
  origin_destination_id: string;
  destination_destination_id: string;
  mode: string;
  estimated_duration_minutes: number | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  schedule_notes: string | null;
  source_name: string | null;
  source_url: string | null;
  source_verified_at: string | null;
  confidence_status: string;
}

export function mapDestination(row: DestinationRow): Destination {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    zone: row.zone,
    category: pick<DestinationCategory>(
      "destination",
      row.id,
      "category",
      DESTINATION_CATEGORIES,
      row.category,
    ),
    estimatedVisitMinutes: row.estimated_visit_minutes,
    latitude: row.latitude,
    longitude: row.longitude,
    active: row.active,
    source: toSource(row.source_name, row.source_url, row.source_verified_at),
    confidence: toConfidence("destination", row.id, row.confidence_status),
  };
}

export function mapExperience(row: ExperienceRow): Experience {
  return {
    id: row.id,
    destinationId: row.destination_id,
    name: row.name,
    category: pick<ExperienceCategory>(
      "experience",
      row.id,
      "category",
      EXPERIENCE_CATEGORIES,
      row.category,
    ),
    interests: row.interests.map((interest) =>
      pick<Interest>("experience", row.id, "interests", INTERESTS, interest),
    ),
    estimatedDurationMinutes: row.estimated_duration_minutes,
    budgetLevel:
      row.budget_level === null
        ? null
        : pick<BudgetLevel>(
            "experience",
            row.id,
            "budget_level",
            BUDGET_LEVELS,
            row.budget_level,
          ),
    description: row.description,
    source: toSource(row.source_name, row.source_url, row.source_verified_at),
    confidence: toConfidence("experience", row.id, row.confidence_status),
  };
}

export function mapTransportOption(row: TransportOptionRow): TransportOption {
  return {
    id: row.id,
    originDestinationId: row.origin_destination_id,
    destinationDestinationId: row.destination_destination_id,
    mode: pick<TransportMode>(
      "transport_option",
      row.id,
      "mode",
      TRANSPORT_MODES,
      row.mode,
    ),
    estimatedDurationMinutes: row.estimated_duration_minutes,
    priceMin: row.price_min,
    priceMax: row.price_max,
    currency: row.currency,
    scheduleNotes: row.schedule_notes,
    source: toSource(row.source_name, row.source_url, row.source_verified_at),
    confidence: toConfidence(
      "transport_option",
      row.id,
      row.confidence_status,
    ),
  };
}
