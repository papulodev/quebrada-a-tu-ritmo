import { describe, expect, it } from "vitest";
import { DESTINATIONS } from "../../catalog/domain/destinations";
import { EXPERIENCES } from "../../catalog/domain/experiences";
import type { Destination, Experience } from "../../catalog/domain/types";
import type { TravelPreferences } from "../../planner/domain/types";
import {
  rankExperiences,
  type ExperienceRanking,
  type ScoredExperience,
} from "./rank-experiences";

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
const away = destination({
  id: "dest-away",
  slug: "dest-away",
  name: "Localidad lejana",
});
const closed = destination({
  id: "dest-closed",
  slug: "dest-closed",
  name: "Localidad cerrada",
  active: false,
});
const catalogue = [home, away, closed];

function includedIds(ranking: ExperienceRanking): string[] {
  return ranking.included.map(({ experience }) => experience.id);
}

function entryOf(ranking: ExperienceRanking, id: string): ScoredExperience {
  const found = ranking.included.find(
    (scored) => scored.experience.id === id,
  );

  if (!found) {
    throw new Error(`Expected experience ${id} to be included.`);
  }

  return found;
}

function reasonOf(ranking: ExperienceRanking, id: string): string {
  const found = ranking.excluded.find(
    (excluded) => excluded.experience.id === id,
  );

  if (!found) {
    throw new Error(`Expected experience ${id} to be excluded.`);
  }

  return found.reason;
}

describe("rankExperiences", () => {
  it("scores shared interests and keeps unmatched ones at zero", () => {
    const view = experience({
      id: "exp-view",
      name: "Mirador de prueba",
      interests: ["landscape", "photography"],
    });
    const museum = experience({
      id: "exp-museum",
      name: "Museo de prueba",
      interests: ["archaeology", "history"],
    });
    const ranking = rankExperiences(preferences(), [view, museum], catalogue);

    expect(includedIds(ranking)).toEqual(["exp-view", "exp-museum"]);
    expect(entryOf(ranking, "exp-view").score).toBe(3);
    expect(entryOf(ranking, "exp-view").matchedInterests).toEqual([
      "landscape",
    ]);
    expect(entryOf(ranking, "exp-museum").score).toBe(0);
    expect(entryOf(ranking, "exp-museum").matchedInterests).toEqual([]);
    expect(ranking.excluded).toEqual([]);
  });

  it("changes the ranking between travellers with different interests", () => {
    const view = experience({
      id: "exp-view",
      interests: ["landscape", "photography"],
    });
    const museum = experience({
      id: "exp-museum",
      interests: ["archaeology", "history"],
    });
    const experiences = [view, museum];

    const landscapeOrder = includedIds(
      rankExperiences(preferences(), experiences, catalogue),
    );
    const archaeologyOrder = includedIds(
      rankExperiences(
        preferences({ interests: ["archaeology"] }),
        experiences,
        catalogue,
      ),
    );

    expect(landscapeOrder).toEqual(["exp-view", "exp-museum"]);
    expect(archaeologyOrder).toEqual(["exp-museum", "exp-view"]);
  });

  it("boosts experiences at the destination chosen as lodging base", () => {
    const awayExperience = experience({
      id: "exp-away",
      destinationId: "dest-away",
    });
    const homeExperience = experience({ id: "exp-home" });
    const experiences = [awayExperience, homeExperience];

    const decided = rankExperiences(
      preferences({ lodging: { decided: true, destinationId: "dest-home" } }),
      experiences,
      catalogue,
    );

    expect(includedIds(decided)).toEqual(["exp-home", "exp-away"]);
    expect(entryOf(decided, "exp-home").score).toBe(5);
    expect(entryOf(decided, "exp-away").score).toBe(3);

    const undecided = rankExperiences(preferences(), experiences, catalogue);

    expect(includedIds(undecided)).toEqual(["exp-away", "exp-home"]);
    expect(entryOf(undecided, "exp-home").score).toBe(3);
  });

  it("does not boost a lodging base without a chosen destination", () => {
    const awayExperience = experience({
      id: "exp-away",
      destinationId: "dest-away",
    });
    const homeExperience = experience({ id: "exp-home" });
    const ranking = rankExperiences(
      preferences({ lodging: { decided: true, destinationId: null } }),
      [awayExperience, homeExperience],
      catalogue,
    );

    expect(includedIds(ranking)).toEqual(["exp-away", "exp-home"]);
    expect(entryOf(ranking, "exp-home").score).toBe(3);
  });

  it("penalizes experiences above budget without excluding them", () => {
    const ranking = rankExperiences(
      preferences({ budget: "low" }),
      [
        experience({ id: "exp-pricey", budgetLevel: "high" }),
        experience({ id: "exp-matched", budgetLevel: "low" }),
        experience({ id: "exp-unknown", budgetLevel: null }),
      ],
      catalogue,
    );

    expect(includedIds(ranking)).toEqual([
      "exp-matched",
      "exp-unknown",
      "exp-pricey",
    ]);
    expect(entryOf(ranking, "exp-matched").score).toBe(3);
    expect(entryOf(ranking, "exp-unknown").score).toBe(3);
    expect(entryOf(ranking, "exp-pricey").score).toBe(1);
    expect(ranking.excluded).toEqual([]);
  });

  it("excludes experiences at inactive destinations with a reason", () => {
    const ranking = rankExperiences(
      preferences(),
      [experience({ id: "exp-closed", destinationId: "dest-closed" })],
      catalogue,
    );

    expect(ranking.included).toEqual([]);
    expect(reasonOf(ranking, "exp-closed")).toContain("Localidad cerrada");
    expect(reasonOf(ranking, "exp-closed")).toContain("no está activo");
  });

  it("excludes experiences whose destination is not in the catalogue", () => {
    const ranking = rankExperiences(
      preferences(),
      [experience({ id: "exp-missing", destinationId: "dest-missing" })],
      catalogue,
    );

    expect(ranking.included).toEqual([]);
    expect(reasonOf(ranking, "exp-missing")).toContain(
      "no está en el catálogo",
    );
  });

  it("returns empty results for an empty experience list", () => {
    expect(rankExperiences(preferences(), [], catalogue)).toEqual({
      included: [],
      excluded: [],
    });
  });

  it("keeps declaration order when scores tie", () => {
    const experiences = [
      experience({ id: "exp-third" }),
      experience({ id: "exp-first" }),
      experience({ id: "exp-second" }),
    ];
    const ranking = rankExperiences(preferences(), experiences, catalogue);

    expect(includedIds(ranking)).toEqual([
      "exp-third",
      "exp-first",
      "exp-second",
    ]);
    expect(new Set(ranking.included.map(({ score }) => score)).size).toBe(1);
  });

  it("keeps experiences with unknown logistics in the ranking", () => {
    const incomplete = experience({
      id: "exp-incomplete",
      estimatedDurationMinutes: null,
      budgetLevel: null,
      source: null,
    });
    const ranking = rankExperiences(preferences(), [incomplete], catalogue);

    expect(includedIds(ranking)).toEqual(["exp-incomplete"]);
    expect(ranking.excluded).toEqual([]);
  });

  it("ranks the whole curated catalogue without exclusions", () => {
    const ranking = rankExperiences(
      basePreferences,
      EXPERIENCES,
      DESTINATIONS,
    );

    expect(ranking.included).toHaveLength(EXPERIENCES.length);
    expect(ranking.excluded).toEqual([]);
  });
});
