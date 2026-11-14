import { describe, expect, it } from "vitest";
import { DESTINATIONS } from "./destinations";
import { EXPERIENCES, findExperiencesByDestination } from "./experiences";
import {
  BUDGET_LEVELS,
  EXPERIENCE_CATEGORIES,
  INTERESTS,
} from "./types";
import type { Experience } from "./types";

const experiences: readonly Experience[] = EXPERIENCES.map((experience) => ({
  ...experience,
  interests: [...experience.interests],
}));

describe("curated experiences", () => {
  it("references an existing destination in every record", () => {
    const destinationIds = new Set<string>(
      DESTINATIONS.map(({ id }) => id),
    );

    for (const experience of experiences) {
      expect(destinationIds.has(experience.destinationId)).toBe(true);
    }
  });

  it("uses controlled interests and categories", () => {
    for (const experience of experiences) {
      expect(EXPERIENCE_CATEGORIES).toContain(experience.category);
      expect(experience.interests.length).toBeGreaterThan(0);
      for (const interest of experience.interests) {
        expect(INTERESTS).toContain(interest);
      }
    }
  });

  it("keeps durations and budget levels valid or null, never zero", () => {
    for (const experience of experiences) {
      if (experience.estimatedDurationMinutes !== null) {
        expect(experience.estimatedDurationMinutes).toBeGreaterThan(0);
      }

      if (experience.budgetLevel !== null) {
        expect(BUDGET_LEVELS).toContain(experience.budgetLevel);
      }
    }
  });

  it("sources every variable fact with a non-pending confidence", () => {
    for (const experience of experiences) {
      const { source, confidence } = experience;

      const hasVariableFacts =
        experience.estimatedDurationMinutes !== null ||
        experience.budgetLevel !== null;

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

  it("uses unique ids and returns experiences by destination", () => {
    const ids = experiences.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(findExperiencesByDestination("dest-humahuaca").length).toBeGreaterThan(
      0,
    );
    expect(findExperiencesByDestination("dest-nowhere")).toEqual([]);
  });
});
