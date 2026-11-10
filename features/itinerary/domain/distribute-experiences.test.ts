import { describe, expect, it } from "vitest";
import { DESTINATIONS } from "../../catalog/domain/destinations";
import { EXPERIENCES } from "../../catalog/domain/experiences";
import type { Destination, Experience } from "../../catalog/domain/types";
import type {
  ItineraryDay,
  TravelPreferences,
} from "../../planner/domain/types";
import {
  rankExperiences,
  type ExperienceRanking,
} from "./rank-experiences";
import {
  distributeExperiences,
  type ExperienceDistribution,
} from "./distribute-experiences";

const basePreferences: TravelPreferences = {
  days: 3,
  origin: { kind: "salta" },
  mobility: "without_car",
  lodging: { decided: false },
  budget: "medium",
  interests: ["landscape"],
  pace: "balanced",
};

function preferences(
  overrides: Partial<TravelPreferences> = {},
): TravelPreferences {
  return { ...basePreferences, ...overrides };
}

function destination(overrides: Partial<Destination> = {}): Destination {
  return {
    id: "dest-home",
    slug: "dest-home",
    name: "Localidad base",
    description: "Localidad ficticia para las pruebas.",
    zone: "Zona de prueba",
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
    id: "exp-base",
    destinationId: "dest-home",
    name: "Experiencia de prueba",
    category: "viewpoint",
    interests: ["landscape"],
    estimatedDurationMinutes: null,
    budgetLevel: null,
    description: "Experiencia ficticia para las pruebas.",
    source: null,
    confidence: "needs_verification",
    ...overrides,
  };
}

const home = destination();
const attraction = destination({
  id: "dest-attraction",
  slug: "dest-attraction",
  name: "Atracción de prueba",
  category: "attraction",
});
const catalogue = [home, attraction];

function experiences(
  count: number,
  overrides: Partial<Experience> = {},
): Experience[] {
  return Array.from({ length: count }, (_, index) =>
    experience({
      id: `exp-${index + 1}`,
      name: `Experiencia ${index + 1}`,
      ...overrides,
    }),
  );
}

function rankingOf(items: Experience[]): ExperienceRanking {
  return {
    included: items.map((item) => ({
      experience: item,
      score: 0,
      matchedInterests: [],
    })),
    excluded: [],
  };
}

function idsByDay(distribution: ExperienceDistribution): string[][] {
  return distribution.days.map((day) =>
    day.blocks.map((block) => block.id),
  );
}

function dayOf(
  distribution: ExperienceDistribution,
  dayNumber: number,
): ItineraryDay {
  const found = distribution.days.find(
    (day) => day.dayNumber === dayNumber,
  );

  if (!found) {
    throw new Error(`Expected day ${dayNumber} to exist.`);
  }

  return found;
}

function unscheduledReasonOf(
  distribution: ExperienceDistribution,
  id: string,
): string {
  const found = distribution.unscheduled.find(
    ({ experience }) => experience.id === id,
  );

  if (!found) {
    throw new Error(`Expected experience ${id} to be unscheduled.`);
  }

  return found.reason;
}

describe("distributeExperiences", () => {
  it("fills days in order respecting the activity cap", () => {
    const distribution = distributeExperiences(
      preferences({ days: 3 }),
      rankingOf(experiences(7)),
      catalogue,
    );

    expect(distribution.days.map((day) => day.dayNumber)).toEqual([1, 2, 3]);
    expect(idsByDay(distribution)).toEqual([
      ["exp-1", "exp-2", "exp-3"],
      ["exp-4", "exp-5", "exp-6"],
      ["exp-7"],
    ]);
    expect(distribution.unscheduled).toEqual([]);
  });

  it("marks the leftovers as unscheduled on a single-day trip", () => {
    const distribution = distributeExperiences(
      preferences({ days: 1 }),
      rankingOf(experiences(5)),
      catalogue,
    );

    expect(idsByDay(distribution)).toEqual([["exp-1", "exp-2", "exp-3"]]);
    expect(
      distribution.unscheduled.map(({ experience }) => experience.id),
    ).toEqual(["exp-4", "exp-5"]);
    expect(unscheduledReasonOf(distribution, "exp-4")).toContain("1 día");
    expect(unscheduledReasonOf(distribution, "exp-4")).toContain(
      "No queda lugar",
    );
  });

  it("spreads activities across a five-day relaxed trip", () => {
    const distribution = distributeExperiences(
      preferences({ days: 5, pace: "relaxed" }),
      rankingOf(experiences(9)),
      catalogue,
    );

    const lengths = distribution.days.map((day) => day.blocks.length);
    expect(lengths).toEqual([2, 2, 2, 2, 1]);
  });

  it("applies a different activity cap per pace", () => {
    const tenExperiences = experiences(10);

    const relaxed = distributeExperiences(
      preferences({ days: 1, pace: "relaxed" }),
      rankingOf(tenExperiences),
      catalogue,
    );
    const balanced = distributeExperiences(
      preferences({ days: 1, pace: "balanced" }),
      rankingOf(tenExperiences),
      catalogue,
    );
    const intensive = distributeExperiences(
      preferences({ days: 1, pace: "intensive" }),
      rankingOf(tenExperiences),
      catalogue,
    );

    expect(dayOf(relaxed, 1).blocks).toHaveLength(2);
    expect(dayOf(balanced, 1).blocks).toHaveLength(3);
    expect(dayOf(intensive, 1).blocks).toHaveLength(4);
    expect(relaxed.unscheduled).toHaveLength(8);
    expect(balanced.unscheduled).toHaveLength(7);
    expect(intensive.unscheduled).toHaveLength(6);
  });

  it("respects the minute budget for known durations", () => {
    const distribution = distributeExperiences(
      preferences({ days: 1, pace: "intensive" }),
      rankingOf(experiences(4, { estimatedDurationMinutes: 200 })),
      catalogue,
    );

    expect(idsByDay(distribution)).toEqual([["exp-1", "exp-2"]]);
    expect(unscheduledReasonOf(distribution, "exp-3")).toContain(
      "No queda lugar",
    );
  });

  it("never treats an unknown duration as zero minutes", () => {
    const timed = experience({
      id: "exp-timed",
      name: "Experiencia cronometrada",
      estimatedDurationMinutes: 360,
    });
    const untimed = [
      experience({
        id: "exp-unknown-1",
        name: "Experiencia sin duración 1",
      }),
      experience({
        id: "exp-unknown-2",
        name: "Experiencia sin duración 2",
      }),
    ];

    const distribution = distributeExperiences(
      preferences({ days: 1 }),
      rankingOf([timed, ...untimed]),
      catalogue,
    );

    expect(idsByDay(distribution)).toEqual([
      ["exp-timed", "exp-unknown-1", "exp-unknown-2"],
    ]);
    expect(
      dayOf(distribution, 1).blocks.map(
        (block) => block.estimatedDurationMinutes,
      ),
    ).toEqual([360, null, null]);
    expect(distribution.warnings).toContain(
      "Algunas actividades del itinerario no tienen duración estimada en el catálogo, así que el tiempo total de esos días no se puede confirmar.",
    );
  });

  it("leaves experiences longer than the daily budget unscheduled", () => {
    const long = experience({
      id: "exp-long",
      name: "Experiencia extensa",
      estimatedDurationMinutes: 600,
    });

    const distribution = distributeExperiences(
      preferences({ days: 1, pace: "intensive" }),
      rankingOf([long]),
      catalogue,
    );

    expect(idsByDay(distribution)).toEqual([[]]);
    expect(unscheduledReasonOf(distribution, "exp-long")).toContain(
      "600 minutos",
    );
    expect(distribution.warnings).toContain(
      "Quedaron días del viaje sin actividades asignadas.",
    );
  });

  it("returns the whole trip as empty days for an empty ranking", () => {
    const distribution = distributeExperiences(
      preferences({ days: 2 }),
      rankingOf([]),
      catalogue,
    );

    expect(idsByDay(distribution)).toEqual([[], []]);
    expect(
      distribution.days.map((day) => day.destinationCategory),
    ).toEqual([null, null]);
    expect(distribution.warnings).toEqual([
      "Quedaron días del viaje sin actividades asignadas.",
    ]);
  });

  it("labels each day with the category of its first block's destination", () => {
    const distribution = distributeExperiences(
      preferences({ days: 2, pace: "relaxed" }),
      rankingOf([
        experience({ id: "exp-home-1", name: "Experiencia local 1" }),
        experience({ id: "exp-home-2", name: "Experiencia local 2" }),
        experience({
          id: "exp-attraction-1",
          name: "Experiencia de atracción 1",
          destinationId: attraction.id,
        }),
        experience({
          id: "exp-attraction-2",
          name: "Experiencia de atracción 2",
          destinationId: attraction.id,
        }),
      ]),
      catalogue,
    );

    expect(dayOf(distribution, 1).destinationCategory).toBe("locality");
    expect(dayOf(distribution, 2).destinationCategory).toBe("attraction");
  });

  it("is deterministic for the same inputs", () => {
    const first = distributeExperiences(
      preferences(),
      rankingOf(experiences(5)),
      catalogue,
    );
    const second = distributeExperiences(
      preferences(),
      rankingOf(experiences(5)),
      catalogue,
    );

    expect(second).toEqual(first);
  });

  it("distributes the curated catalogue across three balanced days", () => {
    const ranking = rankExperiences(
      basePreferences,
      EXPERIENCES,
      DESTINATIONS,
    );
    const distribution = distributeExperiences(
      basePreferences,
      ranking,
      DESTINATIONS,
    );

    expect(distribution.days.map((day) => day.dayNumber)).toEqual([1, 2, 3]);
    const lengths = distribution.days.map((day) => day.blocks.length);
    expect(lengths).toEqual([3, 3, 0]);
    expect(distribution.unscheduled).toEqual([]);
    expect(distribution.warnings).toHaveLength(2);
    expect(distribution.warnings).toContain(
      "Algunas actividades del itinerario no tienen duración estimada en el catálogo, así que el tiempo total de esos días no se puede confirmar.",
    );
    expect(distribution.warnings).toContain(
      "Quedaron días del viaje sin actividades asignadas.",
    );
  });

  it("rejects trips without travel days", () => {
    expect(() =>
      distributeExperiences(preferences({ days: 0 }), rankingOf([]), catalogue),
    ).toThrow(RangeError);
    expect(() =>
      distributeExperiences(preferences({ days: 0 }), rankingOf([]), catalogue),
    ).toThrow("at least one travel day");
  });
});
