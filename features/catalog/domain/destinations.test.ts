import { describe, expect, it } from "vitest";
import { DESTINATIONS, findDestinationBySlug } from "./destinations";
import type { Destination } from "./types";

const destinations: readonly Destination[] = DESTINATIONS;

describe("curated destinations", () => {
  it("includes the localities required by the backlog", () => {
    const slugs = destinations.map((destination) => destination.slug);

    expect(slugs).toEqual(
      expect.arrayContaining(["tilcara", "purmamarca", "maimara", "humahuaca"]),
    );
  });

  it("uses unique, non-empty identifiers and slugs", () => {
    const ids = destinations.map((destination) => destination.id);
    const slugs = destinations.map((destination) => destination.slug);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const destination of destinations) {
      expect(destination.id.length).toBeGreaterThan(0);
      expect(destination.slug.length).toBeGreaterThan(0);
      expect(destination.description.length).toBeGreaterThan(0);
    }
  });

  it("sources every variable fact with a non-pending confidence", () => {
    for (const destination of destinations) {
      const { source, confidence } = destination;

      expect(destination.active).toBe(true);

      if (destination.estimatedVisitMinutes !== null) {
        expect(destination.estimatedVisitMinutes).toBeGreaterThan(0);
      }

      const hasVariableFacts =
        destination.estimatedVisitMinutes !== null ||
        destination.latitude !== null ||
        destination.longitude !== null;

      if (hasVariableFacts) {
        expect(source).not.toBeNull();
        expect(source?.sourceName.length ?? 0).toBeGreaterThan(0);
        expect(confidence).not.toBe("needs_verification");
      }

      if (confidence !== "needs_verification") {
        expect(source).not.toBeNull();
      }

      if (source?.verifiedAt) {
        expect(source.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("finds a destination by slug and returns undefined otherwise", () => {
    expect(findDestinationBySlug("tilcara")?.name).toBe("Tilcara");
    expect(findDestinationBySlug("nowhere")).toBeUndefined();
  });
});
