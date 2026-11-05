import { describe, expect, it } from "vitest";
import {
  InvalidCatalogueRowError,
  mapDestination,
  mapExperience,
  mapTransportOption,
  type DestinationRow,
  type ExperienceRow,
  type TransportOptionRow,
} from "./catalog-mappers";

function destinationRow(overrides: Partial<DestinationRow> = {}): DestinationRow {
  return {
    id: "dest-tilcara",
    slug: "tilcara",
    name: "Tilcara",
    description: "Localidad de la Quebrada Central.",
    zone: "Quebrada Central",
    category: "locality",
    estimated_visit_minutes: 180,
    latitude: -23.576,
    longitude: -65.394,
    active: true,
    source_name: "Municipalidad de Tilcara",
    source_url: "https://example.test/tilcara",
    source_verified_at: "2026-10-29",
    confidence_status: "verified",
    ...overrides,
  };
}

function experienceRow(overrides: Partial<ExperienceRow> = {}): ExperienceRow {
  return {
    id: "exp-pucara",
    destination_id: "dest-tilcara",
    name: "Pucará de Tilcara",
    category: "archaeological_site",
    interests: ["archaeology", "history"],
    estimated_duration_minutes: null,
    budget_level: null,
    description: "Sitio arqueológico.",
    source_name: null,
    source_url: null,
    source_verified_at: null,
    confidence_status: "needs_verification",
    ...overrides,
  };
}

function transportRow(
  overrides: Partial<TransportOptionRow> = {},
): TransportOptionRow {
  return {
    id: "tr-tilcara-purma-bus",
    origin_destination_id: "dest-tilcara",
    destination_destination_id: "dest-purma",
    mode: "bus",
    estimated_duration_minutes: null,
    price_min: null,
    price_max: null,
    currency: "ARS",
    schedule_notes: null,
    source_name: null,
    source_url: null,
    source_verified_at: null,
    confidence_status: "needs_verification",
    ...overrides,
  };
}

describe("catalogue row mappers", () => {
  it("maps a destination with its source reference", () => {
    expect(mapDestination(destinationRow())).toEqual({
      id: "dest-tilcara",
      slug: "tilcara",
      name: "Tilcara",
      description: "Localidad de la Quebrada Central.",
      zone: "Quebrada Central",
      category: "locality",
      estimatedVisitMinutes: 180,
      latitude: -23.576,
      longitude: -65.394,
      active: true,
      source: {
        sourceName: "Municipalidad de Tilcara",
        sourceUrl: "https://example.test/tilcara",
        verifiedAt: "2026-10-29",
      },
      confidence: "verified",
    });
  });

  it("keeps unknown destination values as null instead of zero", () => {
    const destination = mapDestination(
      destinationRow({
        estimated_visit_minutes: null,
        latitude: null,
        longitude: null,
        active: false,
        source_name: null,
        source_url: null,
        source_verified_at: null,
        confidence_status: "needs_verification",
      }),
    );

    expect(destination.estimatedVisitMinutes).toBeNull();
    expect(destination.latitude).toBeNull();
    expect(destination.longitude).toBeNull();
    expect(destination.active).toBe(false);
    expect(destination.source).toBeNull();
    expect(destination.confidence).toBe("needs_verification");
  });

  it("rejects a destination value outside the controlled enums", () => {
    expect(() =>
      mapDestination(destinationRow({ category: "restaurant" })),
    ).toThrow(InvalidCatalogueRowError);
    expect(() =>
      mapDestination(destinationRow({ confidence_status: "confirmed" })),
    ).toThrow(InvalidCatalogueRowError);
  });

  it("maps an experience without inventing duration or budget", () => {
    const experience = mapExperience(experienceRow());

    expect(experience.interests).toEqual(["archaeology", "history"]);
    expect(experience.estimatedDurationMinutes).toBeNull();
    expect(experience.budgetLevel).toBeNull();
    expect(experience.source).toBeNull();
    expect(experience.confidence).toBe("needs_verification");
  });

  it("rejects an experience interest outside the controlled list", () => {
    expect(() =>
      mapExperience(experienceRow({ interests: ["archaeology", "astrology"] })),
    ).toThrow(InvalidCatalogueRowError);
  });

  it("maps a transport option and preserves unknown prices as null", () => {
    expect(mapTransportOption(transportRow())).toMatchObject({
      mode: "bus",
      estimatedDurationMinutes: null,
      priceMin: null,
      priceMax: null,
      currency: "ARS",
      scheduleNotes: null,
      confidence: "needs_verification",
    });

    expect(
      mapTransportOption(
        transportRow({
          estimated_duration_minutes: 45,
          price_min: 600,
          price_max: 900,
          schedule_notes: "Frecuencia no confirmada.",
        }),
      ),
    ).toMatchObject({
      estimatedDurationMinutes: 45,
      priceMin: 600,
      priceMax: 900,
      scheduleNotes: "Frecuencia no confirmada.",
    });
  });

  it("rejects a transport mode outside the controlled list", () => {
    expect(() => mapTransportOption(transportRow({ mode: "boat" }))).toThrow(
      InvalidCatalogueRowError,
    );
  });
});
