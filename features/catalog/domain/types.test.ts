import { describe, expect, it } from "vitest";
import {
  CONFIDENCE_STATUSES,
  isConfidenceStatus,
  isKnownDuration,
  type SourceReference,
} from "./confidence";
import {
  BUDGET_LEVELS,
  DESTINATION_CATEGORIES,
  INTERESTS,
  SOURCE_ENTITY_TYPES,
  TRANSPORT_MODES,
  type Destination,
  type Experience,
  type TransportOption,
} from "./types";

describe("confidence metadata", () => {
  it("accepts only the three controlled statuses", () => {
    for (const status of CONFIDENCE_STATUSES) {
      expect(isConfidenceStatus(status)).toBe(true);
    }
    expect(isConfidenceStatus("confirmed")).toBe(false);
    expect(isConfidenceStatus(null)).toBe(false);
    expect(isConfidenceStatus(1)).toBe(false);
  });

  it("treats unknown durations as unknown, never as zero", () => {
    expect(isKnownDuration(null)).toBe(false);
    expect(isKnownDuration(undefined)).toBe(false);
    expect(isKnownDuration(Number.NaN)).toBe(false);
    expect(isKnownDuration(-1)).toBe(false);
    expect(isKnownDuration(0)).toBe(true);
    expect(isKnownDuration(90)).toBe(true);
  });
});

describe("catalogue types", () => {
  it("models a destination with provenance and an optional visit length", () => {
    const source: SourceReference = {
      sourceName: "Ministerio de Turismo de Jujuy",
      sourceUrl: null,
      verifiedAt: null,
    };
    const destination: Destination = {
      id: "dest-tilcara",
      slug: "tilcara",
      name: "Tilcara",
      description: "Localidad de la Quebrada Central.",
      zone: "Quebrada Central",
      category: "locality",
      estimatedVisitMinutes: null,
      latitude: null,
      longitude: null,
      active: true,
      source,
      confidence: "needs_verification",
    };

    expect(DESTINATION_CATEGORIES).toContain(destination.category);
    expect(destination.estimatedVisitMinutes).toBeNull();
    expect(isConfidenceStatus(destination.confidence)).toBe(true);
  });

  it("models an experience linked to a destination", () => {
    const experience: Experience = {
      id: "exp-pucara",
      destinationId: "dest-tilcara",
      name: "Pucará de Tilcara",
      category: "archaeological_site",
      interests: ["archaeology", "history"],
      estimatedDurationMinutes: null,
      budgetLevel: "low",
      description: "Sitio arqueológico.",
      source: null,
      confidence: "needs_verification",
    };

    expect(experience.destinationId).toBe("dest-tilcara");
    expect(experience.interests.every((i) => INTERESTS.includes(i))).toBe(true);
    expect(BUDGET_LEVELS).toContain(experience.budgetLevel);
  });

  it("models a transport option whose price may be unknown", () => {
    const option: TransportOption = {
      id: "tr-tilcara-humahuaca",
      originDestinationId: "dest-tilcara",
      destinationDestinationId: "dest-humahuaca",
      mode: "bus",
      estimatedDurationMinutes: null,
      priceMin: null,
      priceMax: null,
      currency: "ARS",
      scheduleNotes: null,
      source: null,
      confidence: "needs_verification",
    };

    expect(TRANSPORT_MODES).toContain(option.mode);
    expect(option.priceMin).toBeNull();
    expect(SOURCE_ENTITY_TYPES).toContain("transport_option");
  });
});
