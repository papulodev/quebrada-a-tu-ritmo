import { describe, expect, it } from "vitest";
import type { Experience, Interest } from "../../catalog/domain/types";
import type {
  ItineraryBlock,
  ItineraryDay,
  TravelPreferences,
} from "../../planner/domain/types";
import type {
  ExcludedExperience,
  ExperienceRanking,
  ScoredExperience,
} from "./rank-experiences";
import type { ExperienceDistribution } from "./distribute-experiences";
import { buildRationale } from "./build-rationale";

const basePreferences: TravelPreferences = {
  days: 3,
  origin: { kind: "salta" },
  mobility: "without_car",
  lodging: { decided: false },
  budget: "medium",
  interests: ["landscape"],
  pace: "balanced",
};

function preferences(overrides: Partial<TravelPreferences> = {}): TravelPreferences {
  return { ...basePreferences, ...overrides };
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

function scored(item: Experience, matchedInterests: Interest[]): ScoredExperience {
  return { experience: item, score: 3 * matchedInterests.length, matchedInterests };
}

function visitBlock(title: string): ItineraryBlock {
  return {
    id: "visit",
    kind: "visit",
    title,
    destinationId: "dest-home",
    estimatedDurationMinutes: null,
    notes: null,
    source: null,
    confidence: "needs_verification",
  };
}

function transferBlock(): ItineraryBlock {
  return {
    id: "transfer-1",
    kind: "transfer",
    title: "Traslado de prueba",
    destinationId: "dest-attraction",
    estimatedDurationMinutes: null,
    notes: null,
    source: null,
    confidence: "needs_verification",
  };
}

function day(blocks: ItineraryBlock[]): ItineraryDay {
  return { dayNumber: 1, destinationCategory: null, blocks };
}

function rankingOf(
  included: ScoredExperience[] = [],
  excluded: ExcludedExperience[] = [],
): ExperienceRanking {
  return { included, excluded };
}

function distributionOf(
  overrides: Partial<ExperienceDistribution> = {},
): ExperienceDistribution {
  return { days: [], warnings: [], unscheduled: [], ...overrides };
}

describe("buildRationale", () => {
  describe("interest line", () => {
    it("writes the interests line in singular for one prioritised experience", () => {
      const ranking = rankingOf([
        scored(experience({ id: "exp-mirador", name: "Mirador del río" }), ["landscape"]),
      ]);

      const rationale = buildRationale({
        preferences: preferences(),
        ranking,
        distribution: distributionOf(),
      });

      expect(rationale).toEqual([
        "Se prioriza la actividad Mirador del río por coincidir con el interés elegido: Paisaje.",
      ]);
    });

    it("names every prioritised experience when several matched", () => {
      const ranking = rankingOf([
        scored(experience({ id: "exp-mirador", name: "Mirador del río" }), ["landscape"]),
        scored(experience({ id: "exp-cerro", name: "Cerro de los Siete Colores" }), ["landscape"]),
      ]);

      const rationale = buildRationale({
        preferences: preferences(),
        ranking,
        distribution: distributionOf(),
      });

      expect(rationale).toEqual([
        "Se priorizan actividades como Mirador del río y Cerro de los Siete Colores por coincidir con el interés elegido: Paisaje.",
      ]);
    });

    it("names at most three experiences in the interests line", () => {
      const ranking = rankingOf([
        scored(experience({ id: "exp-uno", name: "Actividad uno" }), ["landscape"]),
        scored(experience({ id: "exp-dos", name: "Actividad dos" }), ["landscape"]),
        scored(experience({ id: "exp-tres", name: "Actividad tres" }), ["landscape"]),
        scored(experience({ id: "exp-cuatro", name: "Actividad cuatro" }), ["landscape"]),
      ]);

      const rationale = buildRationale({
        preferences: preferences(),
        ranking,
        distribution: distributionOf(),
      });

      expect(rationale).toEqual([
        "Se priorizan actividades como Actividad uno, Actividad dos y Actividad tres por coincidir con el interés elegido: Paisaje.",
      ]);
    });

    it("deduplicates the matched interests and agrees the noun", () => {
      const traveller = preferences({
        interests: ["landscape", "nature", "photography"],
      });
      const ranking = rankingOf([
        scored(experience({ id: "exp-pucara", name: "Pucará de Tilcara" }), [
          "landscape",
          "nature",
        ]),
        scored(experience({ id: "exp-sendero", name: "Sendero de los Colorados" }), [
          "nature",
          "photography",
        ]),
      ]);

      const rationale = buildRationale({
        preferences: traveller,
        ranking,
        distribution: distributionOf(),
      });

      expect(rationale).toEqual([
        "Se priorizan actividades como Pucará de Tilcara y Sendero de los Colorados por coincidir con los intereses elegidos: Paisaje, Naturaleza y Fotografía.",
      ]);
    });

    it("omits the interests line when nothing matched", () => {
      const ranking = rankingOf([scored(experience(), [])]);

      const rationale = buildRationale({
        preferences: preferences(),
        ranking,
        distribution: distributionOf(),
      });

      expect(rationale).toEqual([]);
    });
  });

  describe("pace line", () => {
    it("explains the pace caps when the distribution has days", () => {
      const rationale = buildRationale({
        preferences: preferences(),
        ranking: rankingOf(),
        distribution: distributionOf({ days: [day([visitBlock("Experiencia de prueba")])] }),
      });

      expect(rationale).toEqual([
        "Cada día del itinerario respeta un tope de tiempo y de actividades según el ritmo elegido, para que el plan sea realista.",
      ]);
    });

    it("omits the pace line when the distribution has no days", () => {
      const ranking = rankingOf([
        scored(experience({ id: "exp-mirador", name: "Mirador del río" }), ["landscape"]),
      ]);

      const rationale = buildRationale({
        preferences: preferences(),
        ranking,
        distribution: distributionOf(),
      });

      expect(rationale).toEqual([
        "Se prioriza la actividad Mirador del río por coincidir con el interés elegido: Paisaje.",
      ]);
    });
  });

  describe("mobility line", () => {
    it("explains the mobility constraint on intra-day transfers", () => {
      const rationale = buildRationale({
        preferences: preferences(),
        ranking: rankingOf(),
        distribution: distributionOf({
          days: [day([visitBlock("Experiencia de prueba"), transferBlock()])],
        }),
      });

      expect(rationale).toEqual([
        "Cada día del itinerario respeta un tope de tiempo y de actividades según el ritmo elegido, para que el plan sea realista.",
        "Los traslados dentro de un mismo día solo usan medios de transporte compatibles con la movilidad elegida (Sin auto).",
      ]);
    });

    it("labels the chosen mobility in the mobility line", () => {
      const rationale = buildRationale({
        preferences: preferences({ mobility: "own_car" }),
        ranking: rankingOf(),
        distribution: distributionOf({
          days: [day([visitBlock("Experiencia de prueba"), transferBlock()])],
        }),
      });

      expect(rationale).toContain(
        "Los traslados dentro de un mismo día solo usan medios de transporte compatibles con la movilidad elegida (Con auto propio).",
      );
    });

    it("omits the mobility line without intra-day transfers", () => {
      const rationale = buildRationale({
        preferences: preferences(),
        ranking: rankingOf(),
        distribution: distributionOf({ days: [day([visitBlock("Experiencia de prueba")])] }),
      });

      expect(rationale).toEqual([
        "Cada día del itinerario respeta un tope de tiempo y de actividades según el ritmo elegido, para que el plan sea realista.",
      ]);
    });
  });

  describe("engine reasons", () => {
    it("propagates the ranking's exclusion reasons verbatim", () => {
      const ranking = rankingOf([], [
        {
          experience: experience({ id: "exp-ghost", name: "Experiencia fantasma" }),
          reason:
            "No se puede incluir Experiencia fantasma porque su destino no está en el catálogo.",
        },
        {
          experience: experience({ id: "exp-old", name: "Experiencia vieja" }),
          reason:
            "No se puede incluir Experiencia vieja porque Localidad base no está activo en el catálogo.",
        },
      ]);

      const rationale = buildRationale({
        preferences: preferences(),
        ranking,
        distribution: distributionOf(),
      });

      expect(rationale).toEqual([
        "No se puede incluir Experiencia fantasma porque su destino no está en el catálogo.",
        "No se puede incluir Experiencia vieja porque Localidad base no está activo en el catálogo.",
      ]);
    });

    it("propagates the distribution's unscheduled reasons verbatim", () => {
      const rationale = buildRationale({
        preferences: preferences(),
        ranking: rankingOf(),
        distribution: distributionOf({
          days: [day([visitBlock("Experiencia de prueba")])],
          unscheduled: [
            {
              experience: experience({ id: "exp-leftover", name: "Experiencia sobrante" }),
              reason:
                "No queda lugar para Experiencia sobrante en un viaje de 3 días con ritmo equilibrado.",
            },
            {
              experience: experience({
                id: "exp-long",
                name: "Experiencia larga",
                estimatedDurationMinutes: 400,
              }),
              reason:
                "La duración estimada de Experiencia larga (400 minutos) no entra en un día con ritmo equilibrado.",
            },
          ],
        }),
      });

      expect(rationale).toEqual([
        "Cada día del itinerario respeta un tope de tiempo y de actividades según el ritmo elegido, para que el plan sea realista.",
        "No queda lugar para Experiencia sobrante en un viaje de 3 días con ritmo equilibrado.",
        "La duración estimada de Experiencia larga (400 minutos) no entra en un día con ritmo equilibrado.",
      ]);
    });

    it("keeps the distribution's warnings out of the rationale", () => {
      const rationale = buildRationale({
        preferences: preferences(),
        ranking: rankingOf(),
        distribution: distributionOf({
          days: [day([])],
          warnings: [
            "Algunas actividades del itinerario no tienen duración estimada en el catálogo, así que el tiempo total de esos días no se puede confirmar.",
          ],
        }),
      });

      expect(rationale).toEqual([
        "Cada día del itinerario respeta un tope de tiempo y de actividades según el ritmo elegido, para que el plan sea realista.",
      ]);
    });
  });

  describe("overall shape", () => {
    it("emits the lines in a stable order", () => {
      const mirador = experience({ id: "exp-mirador", name: "Mirador del río" });

      const rationale = buildRationale({
        preferences: preferences({ mobility: "without_car" }),
        ranking: rankingOf(
          [scored(mirador, ["landscape"])],
          [
            {
              experience: experience({ id: "exp-ghost", name: "Experiencia fantasma" }),
              reason:
                "No se puede incluir Experiencia fantasma porque su destino no está en el catálogo.",
            },
          ],
        ),
        distribution: distributionOf({
          days: [day([visitBlock("Mirador del río"), transferBlock()])],
          unscheduled: [
            {
              experience: experience({ id: "exp-leftover", name: "Experiencia sobrante" }),
              reason:
                "No queda lugar para Experiencia sobrante en un viaje de 3 días con ritmo equilibrado.",
            },
          ],
        }),
      });

      expect(rationale).toEqual([
        "Se prioriza la actividad Mirador del río por coincidir con el interés elegido: Paisaje.",
        "Cada día del itinerario respeta un tope de tiempo y de actividades según el ritmo elegido, para que el plan sea realista.",
        "Los traslados dentro de un mismo día solo usan medios de transporte compatibles con la movilidad elegida (Sin auto).",
        "No se puede incluir Experiencia fantasma porque su destino no está en el catálogo.",
        "No queda lugar para Experiencia sobrante en un viaje de 3 días con ritmo equilibrado.",
      ]);
    });

    it("returns an empty rationale for empty engine outputs", () => {
      const rationale = buildRationale({
        preferences: preferences(),
        ranking: rankingOf(),
        distribution: distributionOf(),
      });

      expect(rationale).toEqual([]);
    });
  });
});
