import { describe, expect, it } from "vitest";
import type { Itinerary, ItineraryBlock } from "../../planner/domain/types";

import {
  describeSource,
  filterUnscheduledReasons,
  formatDuration,
  formatVerificationDate,
  hasUnverifiedBlocks,
  UNVERIFIED_DATA_NOTICE,
} from "./presentation";

function block(overrides: Partial<ItineraryBlock> = {}): ItineraryBlock {
  return {
    id: "block-1",
    kind: "visit",
    title: "Visita guiada",
    destinationId: null,
    estimatedDurationMinutes: 60,
    notes: null,
    source: null,
    confidence: "needs_verification",
    ...overrides,
  };
}

function buildItinerary(blocks: ItineraryBlock[]): Itinerary {
  return {
    strategyId: "base-en-la-quebrada",
    days: [{ dayNumber: 1, destinationCategory: null, blocks }],
    rationale: [],
    warnings: [],
    unscheduled: [],
  };
}

describe("formatDuration", () => {
  it("formats minutes below one hour as minutes only", () => {
    expect(formatDuration(0)).toBe("0 min");
    expect(formatDuration(1)).toBe("1 min");
    expect(formatDuration(45)).toBe("45 min");
  });

  it("formats exact hours without remaining minutes", () => {
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(240)).toBe("4 h");
  });

  it("combines hours and remaining minutes", () => {
    expect(formatDuration(90)).toBe("1 h 30 min");
    expect(formatDuration(125)).toBe("2 h 5 min");
  });

  it("rejects negative or non-finite minutes", () => {
    expect(() => formatDuration(-1)).toThrow(RangeError);
    expect(() => formatDuration(Number.NaN)).toThrow(RangeError);
  });
});

describe("formatVerificationDate", () => {
  it("formats an ISO date as DD/MM/YYYY", () => {
    expect(formatVerificationDate("2026-11-12")).toBe("12/11/2026");
  });

  it("keeps zero padding for single-digit days and months", () => {
    expect(formatVerificationDate("2026-01-05")).toBe("05/01/2026");
  });

  it("rejects values that are not an ISO calendar date", () => {
    expect(formatVerificationDate("")).toBeNull();
    expect(formatVerificationDate("2026-1-1")).toBeNull();
    expect(formatVerificationDate("12/11/2026")).toBeNull();
    expect(formatVerificationDate("2026-11-12T00:00:00Z")).toBeNull();
  });

  it("rejects impossible calendar dates", () => {
    expect(formatVerificationDate("2026-02-30")).toBeNull();
    expect(formatVerificationDate("2026-13-01")).toBeNull();
    expect(formatVerificationDate("2025-02-29")).toBeNull();
  });
});

describe("describeSource", () => {
  it("states that no source is recorded", () => {
    expect(describeSource(null)).toBe("Sin fuente registrada");
  });

  it("reports the source and the verification date when both exist", () => {
    expect(
      describeSource({
        sourceName: "Catálogo de demostración",
        sourceUrl: null,
        verifiedAt: "2026-11-12",
      }),
    ).toBe("Fuente: Catálogo de demostración · Verificado el 12/11/2026");
  });

  it("does not imply the datum is current when the date is missing", () => {
    expect(
      describeSource({
        sourceName: "Catálogo de demostración",
        sourceUrl: null,
        verifiedAt: null,
      }),
    ).toBe(
      "Fuente: Catálogo de demostración · Fecha de verificación no registrada",
    );
  });

  it("treats an invalid verification date as missing", () => {
    expect(
      describeSource({
        sourceName: "Catálogo de demostración",
        sourceUrl: null,
        verifiedAt: "2026-02-30",
      }),
    ).toBe(
      "Fuente: Catálogo de demostración · Fecha de verificación no registrada",
    );
  });

  it("renders the source name only, never the raw URL", () => {
    const description = describeSource({
      sourceName: "Municipalidad de Humahuaca",
      sourceUrl: "https://example.com/fuente",
      verifiedAt: "2026-11-12",
    });

    expect(description).toBe(
      "Fuente: Municipalidad de Humahuaca · Verificado el 12/11/2026",
    );
    expect(description).not.toContain("https://example.com");
  });
});

describe("UNVERIFIED_DATA_NOTICE", () => {
  it("warns that the datum is unverified and invites confirmation", () => {
    expect(UNVERIFIED_DATA_NOTICE).toMatch(/no están verificados/);
    expect(UNVERIFIED_DATA_NOTICE).toMatch(/confirmar/);
    expect(UNVERIFIED_DATA_NOTICE).toMatch(/horarios/);
    expect(UNVERIFIED_DATA_NOTICE).toMatch(/disponibilidad/);
  });
});

describe("hasUnverifiedBlocks", () => {
  it("detects a block pending verification", () => {
    expect(hasUnverifiedBlocks(buildItinerary([block()]))).toBe(true);
  });

  it("reports false when every block is verified or estimated", () => {
    const itinerary = buildItinerary([
      block({ id: "block-1", confidence: "verified" }),
      block({ id: "block-2", confidence: "estimated" }),
    ]);

    expect(hasUnverifiedBlocks(itinerary)).toBe(false);
  });

  it("reports false when the itinerary has no days", () => {
    expect(hasUnverifiedBlocks({ ...buildItinerary([]), days: [] })).toBe(false);
  });

  it("reports false when a day has no blocks", () => {
    expect(hasUnverifiedBlocks(buildItinerary([]))).toBe(false);
  });
});

describe("filterUnscheduledReasons", () => {
  it("keeps every warning when nothing is unscheduled", () => {
    expect(filterUnscheduledReasons(["A", "B"], [])).toEqual(["A", "B"]);
  });

  it("drops warnings that match an unscheduled reason", () => {
    expect(filterUnscheduledReasons(["A", "B"], [{ reason: "A" }])).toEqual([
      "B",
    ]);
  });

  it("keeps warnings that no unscheduled reason matches", () => {
    expect(filterUnscheduledReasons(["A", "C"], [{ reason: "B" }])).toEqual([
      "A",
      "C",
    ]);
  });

  it("drops every occurrence of a duplicated warning", () => {
    expect(filterUnscheduledReasons(["A", "A"], [{ reason: "A" }])).toEqual([]);
  });
});
