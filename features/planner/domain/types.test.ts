import { describe, expect, it } from "vitest";
import { isKnownDuration } from "../../catalog/domain/confidence";
import {
  MOBILITIES,
  ORIGIN_KINDS,
  PACES,
  type Itinerary,
  type TravelPreferences,
  type TravelStrategy,
} from "./types";

const basePreferences: TravelPreferences = {
  days: 3,
  origin: { kind: "salta" },
  mobility: "without_car",
  lodging: { decided: false },
  budget: "medium",
  interests: ["landscape", "history"],
  pace: "balanced",
};

describe("travel preferences", () => {
  it("models an origin that points at a catalogue destination", () => {
    const preferences: TravelPreferences = {
      ...basePreferences,
      origin: { kind: "quebrada_locality", destinationId: "dest-tilcara" },
    };

    expect(ORIGIN_KINDS).toContain(preferences.origin.kind);
    expect(preferences.origin.kind).toBe("quebrada_locality");
  });

  it("keeps an already-decided base with an unknown place distinguishable", () => {
    const preferences: TravelPreferences = {
      ...basePreferences,
      lodging: { decided: true, destinationId: null },
    };

    expect(preferences.lodging.decided).toBe(true);
    expect(
      preferences.lodging.decided ? preferences.lodging.destinationId : "x",
    ).toBeNull();
  });

  it("uses controlled values for mobility, pace and budget", () => {
    expect(MOBILITIES).toContain(basePreferences.mobility);
    expect(PACES).toContain(basePreferences.pace);
    expect(basePreferences.interests.length).toBeGreaterThan(0);
  });
});

describe("strategies and itineraries", () => {
  it("models a strategy with fit, advantages, limits and warnings", () => {
    const strategy: TravelStrategy = {
      id: "base-quebrada-bus",
      name: "Base en la Quebrada en colectivo",
      summary: "Dormir en la Quebrada y moverse en transporte público.",
      fits: ["viajeros sin auto", "estadías de tres días o más"],
      advantages: ["menos traslados largos por día"],
      limitations: ["depende de frecuencias de colectivo"],
      logistics: ["bus"],
      confidence: "needs_verification",
      warnings: ["Horarios de colectivo sin verificar."],
    };

    expect(strategy.warnings.length).toBeGreaterThan(0);
    expect(strategy.confidence).toBe("needs_verification");
  });

  it("models itinerary blocks whose duration may be unknown", () => {
    const itinerary: Itinerary = {
      strategyId: "excursiones-desde-salta",
      days: [
        {
          dayNumber: 1,
          destinationCategory: "locality",
          blocks: [
            {
              id: "day1-block1",
              kind: "visit",
              title: "Caminata por el pueblo",
              destinationId: "dest-tilcara",
              estimatedDurationMinutes: null,
              notes: null,
              source: null,
              confidence: "needs_verification",
            },
          ],
        },
      ],
      rationale: ["Se priorizó una zona para evitar traslados largos."],
      warnings: ["Duración de la visita sin confirmar."],
      unscheduled: [],
    };

    const block = itinerary.days[0]?.blocks[0];
    expect(block).toBeDefined();
    expect(isKnownDuration(block?.estimatedDurationMinutes)).toBe(false);
    expect(itinerary.warnings).toHaveLength(1);
  });
});
