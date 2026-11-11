// Server-side catalogue queries (QTR-009).
//
// Every statement is parameterised: user input only ever travels as `$n`
// values. Rows are cast in SQL (`::float8`, `::text`) so `pg` cannot hand back
// `numeric` strings or timezone-shifted `Date` objects for values we expose.

import "server-only";

import { getPool } from "@/lib/db";
import type { Destination, Experience, TransportOption } from "../domain/types";
import {
  mapDestination,
  mapExperience,
  mapTransportOption,
  type DestinationRow,
  type ExperienceRow,
  type TransportOptionRow,
} from "./catalog-mappers";

const DESTINATION_COLUMNS = `
  id, slug, name, description, zone, category,
  estimated_visit_minutes,
  latitude::float8 AS latitude,
  longitude::float8 AS longitude,
  active,
  source_name, source_url, source_verified_at::text AS source_verified_at,
  confidence_status
`;

const EXPERIENCE_COLUMNS = `
  id, destination_id, name, category, interests,
  estimated_duration_minutes, budget_level, description,
  source_name, source_url, source_verified_at::text AS source_verified_at,
  confidence_status
`;

const TRANSPORT_COLUMNS = `
  id, origin_destination_id, destination_destination_id, mode,
  estimated_duration_minutes,
  price_min::float8 AS price_min,
  price_max::float8 AS price_max,
  currency, schedule_notes,
  source_name, source_url, source_verified_at::text AS source_verified_at,
  confidence_status
`;

/** Active destinations, alphabetical. */
export async function listDestinations(): Promise<Destination[]> {
  const { rows } = await getPool().query<DestinationRow>(
    `SELECT ${DESTINATION_COLUMNS} FROM destinations WHERE active ORDER BY name`,
  );

  return rows.map(mapDestination);
}

/** A single active destination, or `null` when the slug is unknown. */
export async function findDestinationBySlug(
  slug: string,
): Promise<Destination | null> {
  const { rows } = await getPool().query<DestinationRow>(
    `SELECT ${DESTINATION_COLUMNS} FROM destinations WHERE slug = $1 AND active`,
    [slug],
  );

  return rows[0] === undefined ? null : mapDestination(rows[0]);
}

/** Experiences belonging to a destination, alphabetical. */
export async function listExperiencesByDestination(
  destinationId: string,
): Promise<Experience[]> {
  const { rows } = await getPool().query<ExperienceRow>(
    `SELECT ${EXPERIENCE_COLUMNS} FROM experiences
     WHERE destination_id = $1
     ORDER BY name`,
    [destinationId],
  );

  return rows.map(mapExperience);
}

/** Every catalogue experience, ordered by id so the engine sees a stable list. */
export async function listExperiences(): Promise<Experience[]> {
  const { rows } = await getPool().query<ExperienceRow>(
    `SELECT ${EXPERIENCE_COLUMNS} FROM experiences ORDER BY id`,
  );

  return rows.map(mapExperience);
}

/** Known ways of travelling from one destination to another. */
export async function listTransportOptionsBetween(
  originDestinationId: string,
  destinationDestinationId: string,
): Promise<TransportOption[]> {
  const { rows } = await getPool().query<TransportOptionRow>(
    `SELECT ${TRANSPORT_COLUMNS} FROM transport_options
     WHERE origin_destination_id = $1 AND destination_destination_id = $2
     ORDER BY mode`,
    [originDestinationId, destinationDestinationId],
  );

  return rows.map(mapTransportOption);
}

/** Every known transport option, ordered by id so the engine sees a stable list. */
export async function listTransportOptions(): Promise<TransportOption[]> {
  const { rows } = await getPool().query<TransportOptionRow>(
    `SELECT ${TRANSPORT_COLUMNS} FROM transport_options ORDER BY id`,
  );

  return rows.map(mapTransportOption);
}
