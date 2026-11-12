import { describe, expect, it } from "vitest";
import { DESTINATIONS } from "../../catalog/domain/destinations";
import { EXPERIENCES } from "../../catalog/domain/experiences";
import type {
  Destination,
  Experience,
  TransportOption,
} from "../../catalog/domain/types";
import {
  MOBILITIES,
  type ItineraryDay,
  type Mobility,
  type TravelPreferences,
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

function transportOption(
  overrides: Partial<TransportOption> = {},
): TransportOption {
  return {
    id: "opt-bus-home-attraction",
    originDestinationId: "dest-home",
    destinationDestinationId: "dest-attraction",
    mode: "bus",
    estimatedDurationMinutes: 90,
    priceMin: null,
    priceMax: null,
    currency: "ARS",
    scheduleNotes: null,
    source: null,
    confidence: "estimated",
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

function homeThenAttraction(
  homeOverrides: Partial<Experience> = {},
  attractionOverrides: Partial<Experience> = {},
): Experience[] {
  return [
    experience({
      id: "exp-home-1",
      name: "Experiencia local 1",
      estimatedDurationMinutes: 60,
      ...homeOverrides,
    }),
    experience({
      id: "exp-attraction-1",
      name: "Experiencia de atracción 1",
      destinationId: attraction.id,
      estimatedDurationMinutes: 60,
      ...attractionOverrides,
    }),
  ];
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
      [],
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
      [],
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
      [],
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
      [],
    );
    const balanced = distributeExperiences(
      preferences({ days: 1, pace: "balanced" }),
      rankingOf(tenExperiences),
      catalogue,
      [],
    );
    const intensive = distributeExperiences(
      preferences({ days: 1, pace: "intensive" }),
      rankingOf(tenExperiences),
      catalogue,
      [],
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
      [],
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
      [],
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
      [],
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
      [],
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
      [],
    );

    expect(dayOf(distribution, 1).destinationCategory).toBe("locality");
    expect(dayOf(distribution, 2).destinationCategory).toBe("attraction");
  });

  it("inserts a transfer block between visits at different destinations", () => {
    const distribution = distributeExperiences(
      preferences({ days: 1 }),
      rankingOf(homeThenAttraction()),
      catalogue,
      [transportOption({ scheduleNotes: "Salidas matutinas según temporada." })],
    );

    expect(idsByDay(distribution)).toEqual([
      ["exp-home-1", "transfer-1", "exp-attraction-1"],
    ]);
    expect(dayOf(distribution, 1).blocks[1]).toEqual({
      id: "transfer-1",
      kind: "transfer",
      title: "Traslado en colectivo de Localidad base a Atracción de prueba",
      destinationId: "dest-attraction",
      estimatedDurationMinutes: 90,
      notes: "Salidas matutinas según temporada.",
      source: null,
      confidence: "estimated",
    });
    expect(distribution.warnings).toEqual([]);
  });

  it("charges known transfer durations against the daily budget", () => {
    const ranking = rankingOf(
      homeThenAttraction(
        { estimatedDurationMinutes: 150 },
        { estimatedDurationMinutes: 150 },
      ),
    );

    const rejected = distributeExperiences(
      preferences({ days: 1 }),
      ranking,
      catalogue,
      [transportOption({ estimatedDurationMinutes: 100 })],
    );

    expect(idsByDay(rejected)).toEqual([["exp-home-1"]]);
    expect(unscheduledReasonOf(rejected, "exp-attraction-1")).toContain(
      "No queda lugar",
    );

    const accepted = distributeExperiences(
      preferences({ days: 1 }),
      ranking,
      catalogue,
      [transportOption({ estimatedDurationMinutes: 50 })],
    );

    expect(idsByDay(accepted)).toEqual([
      ["exp-home-1", "transfer-1", "exp-attraction-1"],
    ]);
  });

  it("flags transfers without catalog data instead of assuming zero minutes", () => {
    const distribution = distributeExperiences(
      preferences({ days: 1 }),
      rankingOf(homeThenAttraction()),
      catalogue,
      [],
    );

    expect(idsByDay(distribution)).toEqual([
      ["exp-home-1", "transfer-1", "exp-attraction-1"],
    ]);
    expect(dayOf(distribution, 1).blocks[1]).toEqual({
      id: "transfer-1",
      kind: "transfer",
      title: "Traslado de Localidad base a Atracción de prueba",
      destinationId: "dest-attraction",
      estimatedDurationMinutes: null,
      notes: null,
      source: null,
      confidence: "needs_verification",
    });
    expect(distribution.warnings).toEqual([
      "El traslado de Localidad base a Atracción de prueba no tiene duración confirmada en el catálogo, así que esa combinación de actividades no se puede declarar confirmada.",
    ]);
  });

  it("does not treat a transfer option without duration as confirmed", () => {
    const distribution = distributeExperiences(
      preferences({ days: 1 }),
      rankingOf(homeThenAttraction()),
      catalogue,
      [
        transportOption({
          estimatedDurationMinutes: null,
          scheduleNotes: "Frecuencia sin confirmar.",
          confidence: "needs_verification",
        }),
      ],
    );

    expect(dayOf(distribution, 1).blocks[1]).toMatchObject({
      title: "Traslado en colectivo de Localidad base a Atracción de prueba",
      estimatedDurationMinutes: null,
      notes: "Frecuencia sin confirmar.",
      confidence: "needs_verification",
    });
    expect(distribution.warnings).toEqual([
      "El traslado de Localidad base a Atracción de prueba no tiene duración confirmada en el catálogo, así que esa combinación de actividades no se puede declarar confirmada.",
    ]);
  });

  it("selects only transport modes compatible with the traveller's mobility", () => {
    const options = [
      transportOption({ id: "opt-bus", mode: "bus", estimatedDurationMinutes: 90 }),
      transportOption({ id: "opt-car", mode: "car", estimatedDurationMinutes: 30 }),
      transportOption({
        id: "opt-guided",
        mode: "guided_excursion",
        estimatedDurationMinutes: 120,
      }),
      transportOption({
        id: "opt-train",
        mode: "solar_train",
        estimatedDurationMinutes: 150,
      }),
    ];

    const expectedTitles: Record<Mobility, string> = {
      without_car: "Traslado en colectivo de Localidad base a Atracción de prueba",
      own_car: "Traslado en auto de Localidad base a Atracción de prueba",
      guided_excursions:
        "Traslado en excursión guiada de Localidad base a Atracción de prueba",
      solar_train: "Traslado en tren solar de Localidad base a Atracción de prueba",
      mixed: "Traslado en colectivo de Localidad base a Atracción de prueba",
    };

    for (const mobility of MOBILITIES) {
      const distribution = distributeExperiences(
        preferences({ days: 1, mobility }),
        rankingOf(homeThenAttraction()),
        catalogue,
        options,
      );

      expect(dayOf(distribution, 1).blocks[1].title).toBe(
        expectedTitles[mobility],
      );
    }
  });

  it("treats transfers as unknown when no mode matches the mobility", () => {
    const carOnly = [transportOption({ mode: "car", estimatedDurationMinutes: 30 })];

    const withoutCar = distributeExperiences(
      preferences({ days: 1, mobility: "without_car" }),
      rankingOf(homeThenAttraction()),
      catalogue,
      carOnly,
    );
    expect(dayOf(withoutCar, 1).blocks[1].estimatedDurationMinutes).toBeNull();
    expect(dayOf(withoutCar, 1).blocks[1].confidence).toBe(
      "needs_verification",
    );
    expect(withoutCar.warnings).toHaveLength(1);

    const ownCarWithBus = distributeExperiences(
      preferences({ days: 1, mobility: "own_car" }),
      rankingOf(homeThenAttraction()),
      catalogue,
      [transportOption()],
    );
    expect(dayOf(ownCarWithBus, 1).blocks[1].estimatedDurationMinutes).toBeNull();
    expect(dayOf(ownCarWithBus, 1).blocks[1].confidence).toBe(
      "needs_verification",
    );
    expect(ownCarWithBus.warnings).toHaveLength(1);

    const mixedWithCar = distributeExperiences(
      preferences({ days: 1, mobility: "mixed" }),
      rankingOf(homeThenAttraction()),
      catalogue,
      carOnly,
    );
    expect(dayOf(mixedWithCar, 1).blocks[1].estimatedDurationMinutes).toBe(30);
    expect(dayOf(mixedWithCar, 1).blocks[1].confidence).toBe("estimated");
    expect(mixedWithCar.warnings).toEqual([]);
  });

  it("keeps transfers directional instead of assuming symmetry", () => {
    const distribution = distributeExperiences(
      preferences({ days: 1 }),
      rankingOf([
        experience({
          id: "exp-attraction-1",
          name: "Experiencia de atracción 1",
          destinationId: attraction.id,
          estimatedDurationMinutes: 60,
        }),
        experience({
          id: "exp-home-1",
          name: "Experiencia local 1",
          estimatedDurationMinutes: 60,
        }),
      ]),
      catalogue,
      [transportOption()],
    );

    expect(idsByDay(distribution)).toEqual([
      ["exp-attraction-1", "transfer-1", "exp-home-1"],
    ]);
    expect(dayOf(distribution, 1).blocks[1]).toMatchObject({
      title: "Traslado de Atracción de prueba a Localidad base",
      estimatedDurationMinutes: null,
      confidence: "needs_verification",
    });
    expect(distribution.warnings).toEqual([
      "El traslado de Atracción de prueba a Localidad base no tiene duración confirmada en el catálogo, así que esa combinación de actividades no se puede declarar confirmada.",
    ]);
  });

  it("skips the transfer when consecutive visits share a destination", () => {
    const distribution = distributeExperiences(
      preferences({ days: 1 }),
      rankingOf([
        experience({
          id: "exp-home-1",
          name: "Experiencia local 1",
          estimatedDurationMinutes: 60,
        }),
        experience({
          id: "exp-home-2",
          name: "Experiencia local 2",
          estimatedDurationMinutes: 60,
        }),
      ]),
      catalogue,
      [transportOption()],
    );

    expect(idsByDay(distribution)).toEqual([["exp-home-1", "exp-home-2"]]);
    expect(
      dayOf(distribution, 1).blocks.map((block) => block.kind),
    ).toEqual(["visit", "visit"]);
    expect(distribution.warnings).toEqual([]);
  });

  it("prefers compatible options with a known duration deterministically", () => {
    const distribution = distributeExperiences(
      preferences({ days: 1 }),
      rankingOf(homeThenAttraction()),
      catalogue,
      [
        transportOption({ id: "opt-bus-unknown", estimatedDurationMinutes: null }),
        transportOption({ id: "opt-bus-90", estimatedDurationMinutes: 90 }),
        transportOption({ id: "opt-bus-120", estimatedDurationMinutes: 120 }),
      ],
    );

    expect(dayOf(distribution, 1).blocks[1].estimatedDurationMinutes).toBe(90);
    expect(dayOf(distribution, 1).blocks[1].confidence).toBe("estimated");
    expect(distribution.warnings).toEqual([]);
  });

  it("does not count transfer blocks against the activity cap", () => {
    const ranking = rankingOf([
      ...homeThenAttraction(),
      ...homeThenAttraction(
        { id: "exp-home-2", name: "Experiencia local 2" },
        { id: "exp-attraction-2", name: "Experiencia de atracción 2" },
      ),
    ]);

    const distribution = distributeExperiences(
      preferences({ days: 2 }),
      ranking,
      catalogue,
      [],
    );

    expect(idsByDay(distribution)).toEqual([
      ["exp-home-1", "transfer-1", "exp-attraction-1", "transfer-2", "exp-home-2"],
      ["exp-attraction-2"],
    ]);
    expect(distribution.unscheduled).toEqual([]);
    expect(distribution.warnings).toHaveLength(2);
  });

  it("warns once per unknown transfer pair, even across days", () => {
    const distribution = distributeExperiences(
      preferences({ days: 2 }),
      rankingOf([
        ...homeThenAttraction(),
        experience({
          id: "exp-home-2",
          name: "Experiencia local 2",
          estimatedDurationMinutes: 60,
        }),
        experience({
          id: "exp-home-3",
          name: "Experiencia local 3",
          estimatedDurationMinutes: 60,
        }),
        experience({
          id: "exp-attraction-2",
          name: "Experiencia de atracción 2",
          destinationId: attraction.id,
          estimatedDurationMinutes: 60,
        }),
      ]),
      catalogue,
      [],
    );

    expect(idsByDay(distribution)).toEqual([
      ["exp-home-1", "transfer-1", "exp-attraction-1", "transfer-2", "exp-home-2"],
      ["exp-home-3", "transfer-3", "exp-attraction-2"],
    ]);
    expect(distribution.warnings).toHaveLength(2);
    expect(
      distribution.warnings.filter(
        (warning) =>
          warning ===
          "El traslado de Localidad base a Atracción de prueba no tiene duración confirmada en el catálogo, así que esa combinación de actividades no se puede declarar confirmada.",
      ),
    ).toHaveLength(1);
  });

  it("is deterministic for the same inputs", () => {
    const first = distributeExperiences(
      preferences(),
      rankingOf(experiences(5)),
      catalogue,
      [],
    );
    const second = distributeExperiences(
      preferences(),
      rankingOf(experiences(5)),
      catalogue,
      [],
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
      [],
    );

    expect(distribution.days.map((day) => day.dayNumber)).toEqual([1, 2, 3]);
    const lengths = distribution.days.map((day) => day.blocks.length);
    expect(lengths).toEqual([5, 5, 0]);
    expect(distribution.unscheduled).toEqual([]);
    expect(distribution.warnings).toHaveLength(5);
    expect(distribution.warnings).toContain(
      "Algunas actividades del itinerario no tienen duración estimada en el catálogo, así que el tiempo total de esos días no se puede confirmar.",
    );
    expect(distribution.warnings).toContain(
      "Quedaron días del viaje sin actividades asignadas.",
    );
    expect(distribution.warnings).toContain(
      "El traslado de Tilcara a Purmamarca no tiene duración confirmada en el catálogo, así que esa combinación de actividades no se puede declarar confirmada.",
    );
  });

  it("rejects trips without travel days", () => {
    expect(() =>
      distributeExperiences(
        preferences({ days: 0 }),
        rankingOf([]),
        catalogue,
        [],
      ),
    ).toThrow(RangeError);
    expect(() =>
      distributeExperiences(
        preferences({ days: 0 }),
        rankingOf([]),
        catalogue,
        [],
      ),
    ).toThrow("at least one travel day");
  });
});

describe("distributeExperiences source propagation", () => {
  it("copies the source of a visit from its catalogue experience", () => {
    const source = {
      sourceName: "Catálogo de demostración",
      sourceUrl: null,
      verifiedAt: "2026-11-12",
    };
    const distribution = distributeExperiences(
      preferences({ days: 1 }),
      rankingOf([experience({ id: "exp-home-1", source })]),
      catalogue,
      [],
    );

    const [block] = dayOf(distribution, 1).blocks;
    expect(block.kind).toBe("visit");
    expect(block.source).toEqual(source);
  });

  it("copies the source of a transfer from the selected transport option", () => {
    const source = {
      sourceName: "Cooperativa de transporte",
      sourceUrl: "https://example.com/horarios",
      verifiedAt: "2026-10-30",
    };
    const distribution = distributeExperiences(
      preferences({ days: 1 }),
      rankingOf(homeThenAttraction()),
      catalogue,
      [transportOption({ source })],
    );

    const blocks = dayOf(distribution, 1).blocks;
    expect(blocks.map((block) => block.kind)).toEqual([
      "visit",
      "transfer",
      "visit",
    ]);
    expect(blocks[1].source).toEqual(source);
  });

  it("leaves the transfer source empty when no catalogue option exists", () => {
    const distribution = distributeExperiences(
      preferences({ days: 1 }),
      rankingOf(homeThenAttraction()),
      catalogue,
      [],
    );

    const transfer = dayOf(distribution, 1).blocks[1];
    expect(transfer.kind).toBe("transfer");
    expect(transfer.source).toBeNull();
  });
});
