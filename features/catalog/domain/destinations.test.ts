import { describe, expect, it } from "vitest";
import { DESTINATIONS, findDestinationBySlug } from "./destinations";

describe("curated destinations", () => {
  it("includes the localities required by the backlog", () => {
    const slugs = DESTINATIONS.map((destination) => destination.slug);

    expect(slugs).toEqual(
      expect.arrayContaining(["tilcara", "purmamarca", "maimara", "humahuaca"]),
    );
  });

  it("uses stable, unique identifiers and a short description", () => {
    const ids = DESTINATIONS.map((destination) => destination.id);
    const slugs = DESTINATIONS.map((destination) => destination.slug);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const destination of DESTINATIONS) {
      expect(destination.id).toBe(`dest-${destination.slug}`);
      expect(destination.description.length).toBeGreaterThan(0);
      expect(destination.description.length).toBeLessThanOrEqual(160);
    }
  });

  it("does not assert visit lengths, prices or coordinates without a source", () => {
    for (const destination of DESTINATIONS) {
      expect(destination.estimatedVisitMinutes).toBeNull();
      expect(destination.latitude).toBeNull();
      expect(destination.longitude).toBeNull();
      expect(destination.source).toBeNull();
      expect(destination.confidence).toBe("needs_verification");
      expect(destination.active).toBe(true);
    }
  });

  it("finds a destination by slug and returns undefined otherwise", () => {
    expect(findDestinationBySlug("tilcara")?.name).toBe("Tilcara");
    expect(findDestinationBySlug("nowhere")).toBeUndefined();
  });
});
