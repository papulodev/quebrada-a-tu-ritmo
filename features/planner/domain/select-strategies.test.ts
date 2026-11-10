import { describe, expect, it } from "vitest";
import { selectStrategies } from "./select-strategies";
import type { TravelPreferences } from "./types";

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

function idsOf(profile: TravelPreferences): string[] {
  return selectStrategies(profile).map((strategy) => strategy.id);
}

function firstId(profile: TravelPreferences): string {
  const [first] = selectStrategies(profile);

  if (!first) {
    throw new Error("Expected at least one candidate strategy.");
  }

  return first.id;
}

function strategyById(
  profile: TravelPreferences,
  id: string,
): ReturnType<typeof selectStrategies>[number] | undefined {
  return selectStrategies(profile).find((strategy) => strategy.id === id);
}

const excursionProfile = preferences({
  days: 2,
  origin: { kind: "salta" },
  mobility: "without_car",
  lodging: { decided: false },
  pace: "balanced",
});

const baseProfile = preferences({
  days: 5,
  origin: { kind: "quebrada_locality", destinationId: "dest-tilcara" },
  mobility: "without_car",
  lodging: { decided: true, destinationId: "dest-tilcara" },
  pace: "relaxed",
});

const loopProfile = preferences({
  days: 6,
  origin: { kind: "salta" },
  mobility: "own_car",
  lodging: { decided: false },
  pace: "intensive",
});

const solarProfile = preferences({
  days: 3,
  origin: { kind: "san_salvador_de_jujuy" },
  mobility: "solar_train",
  lodging: { decided: false },
  pace: "balanced",
});

describe("selectStrategies", () => {
  it("returns every candidate, described and never below two options", () => {
    const strategies = selectStrategies(basePreferences);

    expect(strategies.length).toBeGreaterThanOrEqual(2);
    expect(new Set(strategies.map((strategy) => strategy.id)).size).toBe(
      strategies.length,
    );

    for (const strategy of strategies) {
      expect(strategy.name.length).toBeGreaterThan(0);
      expect(strategy.summary.length).toBeGreaterThan(0);
      expect(strategy.fits.length).toBeGreaterThan(0);
      expect(strategy.advantages.length).toBeGreaterThan(0);
      expect(strategy.limitations.length).toBeGreaterThan(0);
      expect(strategy.logistics.length).toBeGreaterThan(0);
      expect(strategy.warnings.length).toBeGreaterThan(0);
      expect(strategy.confidence).toBe("needs_verification");
    }
  });

  it("puts the excursion from Salta first for a short trip without a car", () => {
    expect(firstId(excursionProfile)).toBe("excursiones-desde-salta");
  });

  it("puts the Quebrada base first for a calm stay with a decided base", () => {
    expect(firstId(baseProfile)).toBe("base-en-la-quebrada");
  });

  it("puts the own or combined mobility route first for a long drive", () => {
    expect(firstId(loopProfile)).toBe(
      "recorrido-con-movilidad-propia-o-combinada",
    );
  });

  it("puts the Tren Solar first when the traveller chose that mobility", () => {
    expect(firstId(solarProfile)).toBe("tren-solar");
  });

  it("changes the order between profiles", () => {
    const orders = [
      idsOf(excursionProfile),
      idsOf(baseProfile),
      idsOf(loopProfile),
    ];

    expect(new Set(orders.map((order) => order[0])).size).toBe(3);
    expect(orders[0]).not.toEqual(orders[1]);
    expect(orders[1]).not.toEqual(orders[2]);
  });

  it("reports an unknown origin as a warning on every strategy", () => {
    const strategies = selectStrategies(
      preferences({ origin: { kind: "other" } }),
    );

    for (const strategy of strategies) {
      expect(
        strategy.warnings.some((warning) =>
          warning.includes("no figura en el catálogo"),
        ),
      ).toBe(true);
    }
  });

  it("reports a chosen base without a locality as a warning", () => {
    const base = strategyById(
      preferences({ days: 5, lodging: { decided: true, destinationId: null } }),
      "base-en-la-quebrada",
    );

    expect(
      base?.warnings.some((warning) =>
        warning.includes("no especificó la localidad"),
      ),
    ).toBe(true);
  });

  it("reports undefined transport combinations as warnings", () => {
    const strategies = selectStrategies(preferences({ mobility: "mixed" }));

    for (const strategy of strategies) {
      expect(
        strategy.warnings.some((warning) =>
          warning.includes("combinación de transporte"),
        ),
      ).toBe(true);
    }
  });

  it("says the Tren Solar does not cover every destination", () => {
    const solar = strategyById(solarProfile, "tren-solar");

    expect(
      solar?.warnings.some((warning) =>
        warning.includes("no cubre todos los destinos"),
      ),
    ).toBe(true);
    expect(
      solar?.warnings.some((warning) =>
        warning.includes("deben confirmarse"),
      ),
    ).toBe(true);
  });

  it("marks the Tren Solar as an alternative when it was not chosen", () => {
    const solar = strategyById(loopProfile, "tren-solar");

    expect(
      solar?.warnings.some((warning) =>
        warning.includes("no coincide con la movilidad"),
      ),
    ).toBe(true);
  });

  it("is deterministic for the same preferences", () => {
    expect(selectStrategies(loopProfile)).toEqual(
      selectStrategies(loopProfile),
    );
  });
});
