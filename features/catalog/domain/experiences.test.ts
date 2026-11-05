import { describe, expect, it } from "vitest";
import { DESTINATIONS } from "./destinations";
import { EXPERIENCES, findExperiencesByDestination } from "./experiences";
import { EXPERIENCE_CATEGORIES, INTERESTS } from "./types";

describe("curated experiences", () => {
  it("references an existing destination in every record", () => {
    const destinationIds = new Set(DESTINATIONS.map(({ id }) => id));

    for (const experience of EXPERIENCES) {
      expect(destinationIds.has(experience.destinationId)).toBe(true);
    }
  });

  it("uses controlled interests and categories", () => {
    for (const experience of EXPERIENCES) {
      expect(EXPERIENCE_CATEGORIES).toContain(experience.category);
      expect(experience.interests.length).toBeGreaterThan(0);
      for (const interest of experience.interests) {
        expect(INTERESTS).toContain(interest);
      }
    }
  });

  it("keeps unknown durations and budget levels as null, never zero", () => {
    for (const experience of EXPERIENCES) {
      expect(experience.estimatedDurationMinutes).toBeNull();
      expect(experience.estimatedDurationMinutes).not.toBe(0);
      expect(experience.budgetLevel).toBeNull();
    }
  });

  it("marks every variable fact as pending verification", () => {
    for (const experience of EXPERIENCES) {
      expect(experience.source).toBeNull();
      expect(experience.confidence).toBe("needs_verification");
    }
  });

  it("uses unique ids and returns experiences by destination", () => {
    const ids = EXPERIENCES.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(findExperiencesByDestination("dest-humahuaca").length).toBeGreaterThan(
      0,
    );
    expect(findExperiencesByDestination("dest-nowhere")).toEqual([]);
  });
});
