-- Initial catalogue schema (QTR-008).
--
-- Mirrors features/catalog/domain/types.ts. Rules that keep the data honest
-- are enforced in the database too:
--   * unknown durations, prices and coordinates are NULL, never 0;
--   * every enum is a CHECK constraint, not free text;
--   * a row cannot claim `verified` without a source name and a check date.

CREATE TABLE destinations (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  zone text NOT NULL,
  category text NOT NULL CHECK (
    category IN ('locality', 'attraction', 'natural_area', 'landmark')
  ),
  estimated_visit_minutes integer CHECK (
    estimated_visit_minutes IS NULL OR estimated_visit_minutes > 0
  ),
  latitude numeric(9, 6) CHECK (
    latitude IS NULL OR latitude BETWEEN -90 AND 90
  ),
  longitude numeric(9, 6) CHECK (
    longitude IS NULL OR longitude BETWEEN -180 AND 180
  ),
  active boolean NOT NULL DEFAULT true,
  source_name text,
  source_url text,
  source_verified_at date,
  confidence_status text NOT NULL DEFAULT 'needs_verification' CHECK (
    confidence_status IN ('verified', 'estimated', 'needs_verification')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT destinations_coordinates_together CHECK (
    (latitude IS NULL) = (longitude IS NULL)
  ),
  CONSTRAINT destinations_verified_has_source CHECK (
    confidence_status <> 'verified'
    OR (source_name IS NOT NULL AND source_verified_at IS NOT NULL)
  )
);

CREATE TABLE experiences (
  id text PRIMARY KEY,
  destination_id text NOT NULL REFERENCES destinations (id) ON DELETE RESTRICT,
  name text NOT NULL,
  category text NOT NULL CHECK (
    category IN (
      'archaeological_site',
      'viewpoint',
      'walk',
      'historic_center',
      'market',
      'museum'
    )
  ),
  interests text[] NOT NULL CHECK (
    interests <> '{}'
    AND interests <@ ARRAY[
      'archaeology', 'history', 'landscape', 'nature', 'food', 'hiking',
      'culture', 'photography', 'crafts', 'wellness', 'astronomy'
    ]::text[]
    AND array_position(interests, NULL) IS NULL
  ),
  estimated_duration_minutes integer CHECK (
    estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0
  ),
  budget_level text CHECK (
    budget_level IS NULL OR budget_level IN ('low', 'medium', 'high')
  ),
  description text NOT NULL,
  source_name text,
  source_url text,
  source_verified_at date,
  confidence_status text NOT NULL DEFAULT 'needs_verification' CHECK (
    confidence_status IN ('verified', 'estimated', 'needs_verification')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT experiences_verified_has_source CHECK (
    confidence_status <> 'verified'
    OR (source_name IS NOT NULL AND source_verified_at IS NOT NULL)
  )
);

CREATE INDEX experiences_destination_id_idx ON experiences (destination_id);

CREATE TABLE transport_options (
  id text PRIMARY KEY,
  origin_destination_id text NOT NULL REFERENCES destinations (id) ON DELETE RESTRICT,
  destination_destination_id text NOT NULL REFERENCES destinations (id) ON DELETE RESTRICT,
  mode text NOT NULL CHECK (
    mode IN ('bus', 'solar_train', 'guided_excursion', 'car', 'walk', 'mixed')
  ),
  estimated_duration_minutes integer CHECK (
    estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0
  ),
  price_min numeric(12, 2) CHECK (price_min IS NULL OR price_min >= 0),
  price_max numeric(12, 2) CHECK (price_max IS NULL OR price_max >= 0),
  currency text NOT NULL DEFAULT 'ARS' CHECK (currency ~ '^[A-Z]{3}$'),
  schedule_notes text,
  source_name text,
  source_url text,
  source_verified_at date,
  confidence_status text NOT NULL DEFAULT 'needs_verification' CHECK (
    confidence_status IN ('verified', 'estimated', 'needs_verification')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transport_options_distinct_endpoints CHECK (
    origin_destination_id <> destination_destination_id
  ),
  CONSTRAINT transport_options_price_order CHECK (
    price_min IS NULL OR price_max IS NULL OR price_max >= price_min
  ),
  CONSTRAINT transport_options_verified_has_source CHECK (
    confidence_status <> 'verified'
    OR (source_name IS NOT NULL AND source_verified_at IS NOT NULL)
  )
);

CREATE INDEX transport_options_origin_idx ON transport_options (origin_destination_id);
CREATE INDEX transport_options_destination_idx ON transport_options (destination_destination_id);

CREATE TABLE source_notes (
  id text PRIMARY KEY,
  entity_type text NOT NULL CHECK (
    entity_type IN ('destination', 'experience', 'transport_option')
  ),
  entity_id text NOT NULL,
  source_name text NOT NULL,
  source_url text,
  checked_at date,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX source_notes_entity_idx ON source_notes (entity_type, entity_id);
