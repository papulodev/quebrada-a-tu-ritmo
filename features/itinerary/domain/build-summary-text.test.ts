import { describe, expect, it } from "vitest";
import type { Experience } from "../../catalog/domain/types";
import type { Itinerary, ItineraryBlock } from "../../planner/domain/types";
import type { UnscheduledExperience } from "./distribute-experiences";

import { buildSummaryText } from "./build-summary-text";
import { UNVERIFIED_DATA_NOTICE } from "./presentation";

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

function itinerary(overrides: Partial<Itinerary> = {}): Itinerary {
  return {
    strategyId: "base-en-la-quebrada",
    days: [{ dayNumber: 1, destinationCategory: null, blocks: [block()] }],
    rationale: [],
    warnings: [],
    unscheduled: [],
    ...overrides,
  };
}

function experience(
  overrides: Partial<Experience> = {},
): Experience {
  return {
    id: "experience-1",
    destinationId: "destination-1",
    name: "Pucará de Tilcara",
    category: "archaeological_site",
    interests: ["archaeology"],
    estimatedDurationMinutes: 90,
    budgetLevel: null,
    description: "",
    source: null,
    confidence: "needs_verification",
    ...overrides,
  };
}

function unscheduled(
  overrides: Partial<UnscheduledExperience> = {},
): UnscheduledExperience {
  return {
    experience: experience(),
    reason: "No entra en el ritmo elegido.",
    ...overrides,
  };
}

describe("buildSummaryText", () => {
  it("starts with the summary title", () => {
    expect(buildSummaryText(itinerary()).split("\n")[0]).toBe(
      "Resumen del itinerario — Quebrada a tu ritmo",
    );
  });

  it("states the strategy name when the caller knows it", () => {
    const lines = buildSummaryText(itinerary(), { strategyName: "Base en la Quebrada" })
      .split("\n");

    expect(lines.slice(0, 2)).toEqual([
      "Resumen del itinerario — Quebrada a tu ritmo",
      "Estrategia: Base en la Quebrada",
    ]);
  });

  it("omits the strategy line when the name is blank", () => {
    for (const strategyName of [null, undefined, "", "   "]) {
      expect(buildSummaryText(itinerary(), { strategyName })).not.toContain(
        "Estrategia:",
      );
    }
  });

  it("labels each day with its number and destination category", () => {
    const text = buildSummaryText(
      itinerary({
        days: [
          { dayNumber: 1, destinationCategory: "locality", blocks: [block()] },
          { dayNumber: 2, destinationCategory: null, blocks: [block()] },
        ],
      }),
    );

    expect(text).toContain("Día 1 — Localidad");
    expect(text).toContain("Día 2\n");
    expect(text).not.toContain("Día 2 —");
  });

  it("lists each block with kind, title, estimate and confidence", () => {
    const text = buildSummaryText(
      itinerary({
        days: [
          {
            dayNumber: 1,
            destinationCategory: null,
            blocks: [
              block({ kind: "transfer", title: "Tilcara → Humahuaca", estimatedDurationMinutes: 75 }),
            ],
          },
        ],
      }),
    );

    expect(text).toContain(
      "- Traslado: Tilcara → Humahuaca · duración estimada 1 h 15 min · Datos por confirmar",
    );
  });

  it("never presents an unknown duration as zero", () => {
    const text = buildSummaryText(
      itinerary({
        days: [
          {
            dayNumber: 1,
            destinationCategory: null,
            blocks: [block({ estimatedDurationMinutes: null })],
          },
        ],
      }),
    );

    expect(text).toContain("duración por confirmar");
    expect(text).not.toContain("0 min");
  });

  it("reports a day without assigned activities", () => {
    const text = buildSummaryText(
      itinerary({
        days: [{ dayNumber: 3, destinationCategory: null, blocks: [] }],
      }),
    );

    expect(text).toContain("Día 3");
    expect(text).toContain("Sin actividades asignadas este día.");
  });

  it("lists optional activities with their duration, confidence and reason", () => {
    const text = buildSummaryText(itinerary({ unscheduled: [unscheduled()] }));

    expect(text).toContain("Actividades opcionales");
    expect(text).toContain(
      "- Pucará de Tilcara · duración estimada 1 h 30 min · Datos por confirmar — No entra en el ritmo elegido.",
    );
  });

  it("skips the duration of an optional activity when it is unknown", () => {
    const text = buildSummaryText(
      itinerary({
        unscheduled: [
          unscheduled({
            experience: experience({ estimatedDurationMinutes: null }),
          }),
        ],
      }),
    );

    expect(text).toContain(
      "- Pucará de Tilcara · Datos por confirmar — No entra en el ritmo elegido.",
    );
  });

  it("does not repeat an unscheduled reason under warnings", () => {
    const reason = "No entra en el ritmo elegido.";
    const text = buildSummaryText(
      itinerary({
        warnings: [reason, "El traslado nocturno no está cubierto."],
        unscheduled: [unscheduled({ reason })],
      }),
    );

    expect(text.split(reason)).toHaveLength(2);
    expect(text).toContain("Advertencias");
    expect(text).toContain("- El traslado nocturno no está cubierto.");
  });

  it("omits the warnings section when nothing remains to warn about", () => {
    const reason = "No entra en el ritmo elegido.";
    const text = buildSummaryText(
      itinerary({ warnings: [reason], unscheduled: [unscheduled({ reason })] }),
    );

    expect(text).not.toContain("Advertencias");
  });

  it("omits the optional activities section when nothing was left out", () => {
    expect(buildSummaryText(itinerary())).not.toContain("Actividades opcionales");
  });

  it("closes with the unverified-data notice while any block needs verification", () => {
    const text = buildSummaryText(itinerary());
    const lines = text.split("\n");

    expect(lines.at(-1)).toBe(UNVERIFIED_DATA_NOTICE);
  });

  it("warns that durations are estimates when every block is verified", () => {
    const text = buildSummaryText(
      itinerary({
        days: [
          {
            dayNumber: 1,
            destinationCategory: null,
            blocks: [block({ confidence: "verified" })],
          },
        ],
      }),
    );

    expect(text).not.toContain(UNVERIFIED_DATA_NOTICE);
    expect(text).toContain(
      "Las duraciones son estimaciones del planificador y no confirman horarios ni disponibilidad de transporte.",
    );
  });
});
