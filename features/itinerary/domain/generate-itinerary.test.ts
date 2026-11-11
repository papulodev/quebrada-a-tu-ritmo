// Itinerary composition tests (QTR-021).
//
// The composition is a pure function over the whole engine, so these tests
// pin the response contract the endpoint exposes: the strategy is echoed, the
// days cover the whole trip, unscheduled experiences keep their reason, and an
// empty catalogue degrades to a valid itinerary with an explicit warning.

import { describe, expect, it } from "vitest";

import type {
  Destination,
  Experience,
} from "../../catalog/domain/types";
import type { StrategyId } from "../../planner/domain/select-strategies";
import type { TravelPreferences } from "../../planner/domain/types";
import {
  EMPTY_CATALOG_WARNING,
  generateItinerary,
} from "./generate-itinerary";

const basePreferences: TravelPreferences = {
  days: 2,
  origin: { kind: "salta" },
  mobility: "without_car",
  lodging: { decided: false },
  budget: "medium",
  interests: ["landscape"],
  pace: "balanced",
};

function destination(overrides: Partial<Destination> = {}): Destination {
  return {
    id: "dest-tilcara",
    slug: "dest-tilcara",
    name: "Tilcara",
    description: "Localidad ficticia para las pruebas.",
    zone: "Quebrada de Humahuaca",
    category: "locality",
    estimatedVisitMinutes: null,
    latitude: null,
    longitude: null,
    active: true,
    source: null,
    confidence: "needs_verification",
    ...overrides,
  };
}

function experience(overrides: Partial<Experience> = {}): Experience {
  return {
    id: "exp-caminata",
    destinationId: "dest-tilcara",
    name: "Caminata por el pueblo",
    category: "viewpoint",
    interests: ["landscape"],
    estimatedDurationMinutes: 120,
    budgetLevel: null,
    description: "Experiencia ficticia para las pruebas.",
    source: null,
    confidence: "needs_verification",
    ...overrides,
  };
}

const catalogue = [destination()];
const walk = experience();
const trekking = experience({
  id: "exp-trekking",
  name: "Trekking exigente",
  category: "walk",
  estimatedDurationMinutes: 99999,
});

describe("generateItinerary", () => {
  it("composes days, rationale and warnings from the engine outputs", () => {
    const itinerary = generateItinerary({
      strategyId: "tren-solar",
      preferences: basePreferences,
      catalog: {
        destinations: catalogue,
        experiences: [walk, trekking],
        transportOptions: [],
      },
    });

    expect(itinerary.strategyId).toBe("tren-solar");
    expect(itinerary.days).toHaveLength(2);
    expect(itinerary.days[0].blocks).toHaveLength(1);
    expect(itinerary.days[0].blocks[0]).toMatchObject({
      kind: "visit",
      title: "Caminata por el pueblo",
    });
    expect(itinerary.days[1].blocks).toEqual([]);
    expect(itinerary.warnings).toEqual([
      "Quedaron días del viaje sin actividades asignadas.",
      "La duración estimada de Trekking exigente (99999 minutos) no entra en un día con ritmo equilibrado.",
    ]);
    expect(itinerary.unscheduled).toHaveLength(1);
    expect(itinerary.unscheduled[0].experience.name).toBe("Trekking exigente");
    expect(itinerary.unscheduled[0].reason).toBe(
      "La duración estimada de Trekking exigente (99999 minutos) no entra en un día con ritmo equilibrado.",
    );
    expect(itinerary.rationale.length).toBeGreaterThan(0);
  });

  it("degrades to a valid itinerary with a warning for an empty catalogue", () => {
    const itinerary = generateItinerary({
      strategyId: "tren-solar",
      preferences: basePreferences,
      catalog: {
        destinations: catalogue,
        experiences: [],
        transportOptions: [],
      },
    });

    expect(itinerary.days).toHaveLength(2);
    expect(itinerary.days.map((day) => day.blocks)).toEqual([[], []]);
    expect(itinerary.warnings).toEqual([
      "Quedaron días del viaje sin actividades asignadas.",
      EMPTY_CATALOG_WARNING,
    ]);
  });

  it("rejects a strategy id outside the known set", () => {
    // The endpoint validates the strategy; this test bypasses the validator on
    // purpose to prove the domain guard does not trust a cast.
    const unknownStrategyId: string = "estrategia-inexistente";

    const generate = (): void => {
      generateItinerary({
        strategyId: unknownStrategyId as StrategyId,
        preferences: basePreferences,
        catalog: {
          destinations: [],
          experiences: [],
          transportOptions: [],
        },
      });
    };

    expect(generate).toThrow(RangeError);
    expect(generate).toThrow("known strategy id");
  });
});
