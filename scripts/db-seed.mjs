// Demo catalogue seed (QTR-010, QTR-029).
//
// Loads the curated TypeScript catalogues (destinations, experiences and
// transport options) into PostgreSQL so the app can build a demonstrable
// itinerary. Re-runnable: every statement is an upsert on the primary key, so
// running it twice keeps the same rows instead of duplicating them, and manual
// data that is not in the catalogues is never deleted.
//
// Usage: pnpm run db:seed
// Prefers the direct (non-pooled) connection, like the migration runner.

import { Client } from "pg";

const connectionString = (
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
)?.trim();

if (!connectionString) {
  console.error(
    "DATABASE_URL_UNPOOLED or DATABASE_URL must be set. See .env.example and README.md.",
  );
  process.exit(1);
}

const { DESTINATIONS } = await import(
  "../features/catalog/domain/destinations.ts"
);
const { EXPERIENCES } = await import(
  "../features/catalog/domain/experiences.ts"
);
const { TRANSPORT_OPTIONS } = await import(
  "../features/catalog/domain/transport-options.ts"
);

function fail(message) {
  console.error(`Seed failed: ${message}`);
  process.exit(1);
}

function assertUniqueIds(kind, records) {
  const ids = records.map((record) => record.id);
  if (new Set(ids).size !== ids.length) {
    fail(`${kind} catalogue has duplicate ids`);
  }
}

function assertKnownDestinations(experiences, destinations) {
  const known = new Set(destinations.map((destination) => destination.id));
  for (const experience of experiences) {
    if (!known.has(experience.destinationId)) {
      fail(`experience ${experience.id} points at an unknown destination`);
    }
  }
}

function assertKnownTransportEndpoints(options, destinations) {
  const known = new Set(destinations.map((destination) => destination.id));
  for (const option of options) {
    if (!known.has(option.originDestinationId)) {
      fail(`transport ${option.id} starts at an unknown destination`);
    }
    if (!known.has(option.destinationDestinationId)) {
      fail(`transport ${option.id} ends at an unknown destination`);
    }
    if (option.originDestinationId === option.destinationDestinationId) {
      fail(`transport ${option.id} has the same origin and destination`);
    }
    if (
      option.priceMin !== null &&
      option.priceMax !== null &&
      option.priceMin > option.priceMax
    ) {
      fail(`transport ${option.id} has priceMin greater than priceMax`);
    }
  }
}

assertUniqueIds("destination", DESTINATIONS);
assertUniqueIds("experience", EXPERIENCES);
assertUniqueIds("transport", TRANSPORT_OPTIONS);
assertKnownDestinations(EXPERIENCES, DESTINATIONS);
assertKnownTransportEndpoints(TRANSPORT_OPTIONS, DESTINATIONS);

const client = new Client({ connectionString });

try {
  await client.connect();
  await client.query("BEGIN");

  for (const destination of DESTINATIONS) {
    await client.query(
      `INSERT INTO destinations (
         id, slug, name, description, zone, category,
         estimated_visit_minutes, latitude, longitude, active,
         source_name, source_url, source_verified_at, confidence_status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         slug = EXCLUDED.slug,
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         zone = EXCLUDED.zone,
         category = EXCLUDED.category,
         estimated_visit_minutes = EXCLUDED.estimated_visit_minutes,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         active = EXCLUDED.active,
         source_name = EXCLUDED.source_name,
         source_url = EXCLUDED.source_url,
         source_verified_at = EXCLUDED.source_verified_at,
         confidence_status = EXCLUDED.confidence_status`,
      [
        destination.id,
        destination.slug,
        destination.name,
        destination.description,
        destination.zone,
        destination.category,
        destination.estimatedVisitMinutes,
        destination.latitude,
        destination.longitude,
        destination.active,
        destination.source?.sourceName ?? null,
        destination.source?.sourceUrl ?? null,
        destination.source?.verifiedAt ?? null,
        destination.confidence,
      ],
    );
  }

  for (const experience of EXPERIENCES) {
    await client.query(
      `INSERT INTO experiences (
         id, destination_id, name, category, interests,
         estimated_duration_minutes, budget_level, description,
         source_name, source_url, source_verified_at, confidence_status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         destination_id = EXCLUDED.destination_id,
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         interests = EXCLUDED.interests,
         estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
         budget_level = EXCLUDED.budget_level,
         description = EXCLUDED.description,
         source_name = EXCLUDED.source_name,
         source_url = EXCLUDED.source_url,
         source_verified_at = EXCLUDED.source_verified_at,
         confidence_status = EXCLUDED.confidence_status`,
      [
        experience.id,
        experience.destinationId,
        experience.name,
        experience.category,
        experience.interests,
        experience.estimatedDurationMinutes,
        experience.budgetLevel,
        experience.description,
        experience.source?.sourceName ?? null,
        experience.source?.sourceUrl ?? null,
        experience.source?.verifiedAt ?? null,
        experience.confidence,
      ],
    );
  }

  for (const option of TRANSPORT_OPTIONS) {
    await client.query(
      `INSERT INTO transport_options (
         id, origin_destination_id, destination_destination_id, mode,
         estimated_duration_minutes, price_min, price_max, currency,
         schedule_notes, source_name, source_url, source_verified_at,
         confidence_status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         origin_destination_id = EXCLUDED.origin_destination_id,
         destination_destination_id = EXCLUDED.destination_destination_id,
         mode = EXCLUDED.mode,
         estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
         price_min = EXCLUDED.price_min,
         price_max = EXCLUDED.price_max,
         currency = EXCLUDED.currency,
         schedule_notes = EXCLUDED.schedule_notes,
         source_name = EXCLUDED.source_name,
         source_url = EXCLUDED.source_url,
         source_verified_at = EXCLUDED.source_verified_at,
         confidence_status = EXCLUDED.confidence_status`,
      [
        option.id,
        option.originDestinationId,
        option.destinationDestinationId,
        option.mode,
        option.estimatedDurationMinutes,
        option.priceMin,
        option.priceMax,
        option.currency,
        option.scheduleNotes,
        option.source?.sourceName ?? null,
        option.source?.sourceUrl ?? null,
        option.source?.verifiedAt ?? null,
        option.confidence,
      ],
    );
  }

  await client.query("COMMIT");

  console.log(
    `Seeded ${DESTINATIONS.length} destination(s), ${EXPERIENCES.length} experience(s) and ${TRANSPORT_OPTIONS.length} transport option(s).`,
  );
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  fail(error instanceof Error ? error.message : String(error));
} finally {
  await client.end().catch(() => {});
}
