// Unit tests for the itinerary response validator (QTR-023).

import { describe, expect, it } from "vitest";

import type { Itinerary } from "./types";
import { validateItineraryResponse } from "./validate-itinerary-response";

function expectItinerary(result: Itinerary | null): Itinerary {
  if (result === null) {
    throw new Error("Expected a valid itinerary, but the response was rejected.");
  }
  return result;
}

const validExperience = {
  id: "exp-1",
  destinationId: "dest-tilcara",
  name: "Pucará de Tilcara",
  category: "archaeological_site",
  interests: ["archaeology", "history"],
  estimatedDurationMinutes: 90,
  budgetLevel: "low",
  description: "Sitio arqueológico sobre la Quebrada.",
  source: {
    sourceName: "Catálogo de demostración",
    sourceUrl: null,
    verifiedAt: null,
  },
  confidence: "estimated",
};

const validBlock = {
  id: "block-1",
  kind: "visit",
  title: "Pucará de Tilcara",
  destinationId: "dest-tilcara",
  estimatedDurationMinutes: 90,
  notes: null,
  source: {
    sourceName: "Catálogo de demostración",
    sourceUrl: null,
    verifiedAt: null,
  },
  confidence: "estimated",
};

const validDay = {
  dayNumber: 1,
  destinationCategory: "locality",
  blocks: [validBlock],
};

const validUnscheduled = {
  experience: validExperience,
  reason: "El primer día ya está completo.",
};

const validItinerary = {
  strategyId: "base-en-la-quebrada",
  days: [validDay],
  rationale: ["Se priorizaron experiencias cerca de la base."],
  warnings: ["Los horarios del transporte deben confirmarse."],
  unscheduled: [validUnscheduled],
};

describe("validateItineraryResponse", () => {
  it("accepts a valid itinerary response", () => {
    const result = validateItineraryResponse({ itinerary: validItinerary });

    expect(result).not.toBeNull();
    expect(expectItinerary(result).strategyId).toBe("base-en-la-quebrada");
  });

  it.each([null, [], "itinerary", 42, undefined])(
    "rejects non-object payloads (%s)",
    (payload) => {
      expect(validateItineraryResponse(payload)).toBeNull();
    },
  );

  it("rejects a response without an itinerary", () => {
    expect(validateItineraryResponse({ days: [] })).toBeNull();
  });

  it("rejects a non-object itinerary", () => {
    expect(validateItineraryResponse({ itinerary: "tilcara" })).toBeNull();
  });

  it("ignores unexpected top-level keys", () => {
    const result = validateItineraryResponse({
      itinerary: validItinerary,
      generatedAt: "2026-11-11",
    });

    expect(result).not.toBeNull();
    expect(expectItinerary(result).strategyId).toBe("base-en-la-quebrada");
  });
});

describe("strategy and day list", () => {
  it("rejects an unknown strategy id", () => {
    const result = validateItineraryResponse({
      itinerary: { ...validItinerary, strategyId: "no-existe" },
    });

    expect(result).toBeNull();
  });

  it.each(["1", 1.5, null])("rejects invalid day numbers (%s)", (dayNumber) => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        days: [{ ...validDay, dayNumber }],
      },
    });

    expect(result).toBeNull();
  });

  it("rejects an invalid destination category", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        days: [{ ...validDay, destinationCategory: "planet" }],
      },
    });

    expect(result).toBeNull();
  });

  it("accepts a day without a destination category", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        days: [{ ...validDay, destinationCategory: null }],
      },
    });

    expect(result).not.toBeNull();
  });

  it("accepts empty day, rationale, warning and unscheduled lists", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        days: [],
        rationale: [],
        warnings: [],
        unscheduled: [],
      },
    });

    expect(result).not.toBeNull();
  });
});

describe("blocks", () => {
  it("rejects an invalid block kind", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        days: [{ ...validDay, blocks: [{ ...validBlock, kind: "flight" }] }],
      },
    });

    expect(result).toBeNull();
  });

  it("rejects non-string notes", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        days: [{ ...validDay, blocks: [{ ...validBlock, notes: 5 }] }],
      },
    });

    expect(result).toBeNull();
  });

  it("accepts a block without notes or destination", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        days: [
          {
            ...validDay,
            blocks: [{ ...validBlock, notes: null, destinationId: null }],
          },
        ],
      },
    });

    expect(result).not.toBeNull();
  });

  it("accepts a block without a recorded source", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        days: [{ ...validDay, blocks: [{ ...validBlock, source: null }] }],
      },
    });

    expect(result).not.toBeNull();
    expect(expectItinerary(result).days[0].blocks[0].source).toBeNull();
  });

  it("keeps the source reference of a block", () => {
    const source = {
      sourceName: "Catálogo de demostración",
      sourceUrl: "https://example.com/catalogo",
      verifiedAt: "2026-11-12",
    };
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        days: [{ ...validDay, blocks: [{ ...validBlock, source }] }],
      },
    });

    expect(expectItinerary(result).days[0].blocks[0].source).toEqual(source);
  });

  it.each([{}, "catálogo", 42, { sourceName: 7 }])(
    "rejects a malformed block source (%s)",
    (source) => {
      const result = validateItineraryResponse({
        itinerary: {
          ...validItinerary,
          days: [{ ...validDay, blocks: [{ ...validBlock, source }] }],
        },
      });

      expect(result).toBeNull();
    },
  );
});

describe("unscheduled experiences", () => {
  it("rejects an invalid experience category", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        unscheduled: [
          {
            ...validUnscheduled,
            experience: { ...validExperience, category: "nightlife" },
          },
        ],
      },
    });

    expect(result).toBeNull();
  });

  it("rejects an invalid interest", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        unscheduled: [
          {
            ...validUnscheduled,
            experience: { ...validExperience, interests: ["party"] },
          },
        ],
      },
    });

    expect(result).toBeNull();
  });

  it("rejects an invalid budget level", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        unscheduled: [
          {
            ...validUnscheduled,
            experience: { ...validExperience, budgetLevel: "free" },
          },
        ],
      },
    });

    expect(result).toBeNull();
  });

  it("rejects an invalid source name", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        unscheduled: [
          {
            ...validUnscheduled,
            experience: {
              ...validExperience,
              source: { ...validExperience.source, sourceName: 7 },
            },
          },
        ],
      },
    });

    expect(result).toBeNull();
  });

  it("accepts an experience with unknown duration, budget and source", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        unscheduled: [
          {
            ...validUnscheduled,
            experience: {
              ...validExperience,
              estimatedDurationMinutes: null,
              budgetLevel: null,
              source: null,
            },
          },
        ],
      },
    });

    expect(result).not.toBeNull();
    expect(
      expectItinerary(result).unscheduled[0].experience.source,
    ).toBeNull();
  });

  it("rejects an unscheduled entry without a reason", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        unscheduled: [{ experience: validExperience }],
      },
    });

    expect(result).toBeNull();
  });

  it("rejects a non-object experience", () => {
    const result = validateItineraryResponse({
      itinerary: {
        ...validItinerary,
        unscheduled: [{ ...validUnscheduled, experience: "tilcara" }],
      },
    });

    expect(result).toBeNull();
  });
});

describe("rationale and warnings", () => {
  it("rejects a non-string rationale entry", () => {
    const result = validateItineraryResponse({
      itinerary: { ...validItinerary, rationale: ["Válido", 42] },
    });

    expect(result).toBeNull();
  });

  it("rejects non-string warnings", () => {
    const result = validateItineraryResponse({
      itinerary: { ...validItinerary, warnings: "todas" },
    });

    expect(result).toBeNull();
  });
});
