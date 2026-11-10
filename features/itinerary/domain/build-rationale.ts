// Itinerary rationale (QTR-020).
//
// Pure domain logic: no React, no database, no network. buildRationale takes
// the three inputs that shaped the plan (travel preferences, experience
// ranking and day distribution) and derives the traveller-facing reasons
// that explain why the itinerary looks the way it does (FR-16).
//
// Honesty rules: every line is derived from data the engine itself produced.
// The ranking's exclusion reasons and the distribution's unscheduled
// reasons are propagated verbatim instead of being rephrased, so the
// rationale cannot contradict the engine's own data (FR-21). Composing the
// final Itinerary (days + rationale + warnings) is a separate step of the
// engine (QTR-021).

import type { Interest } from "../../catalog/domain/types";
import type { Mobility, TravelPreferences } from "../../planner/domain/types";
import type { ExperienceRanking } from "./rank-experiences";
import type { ExperienceDistribution } from "./distribute-experiences";

/**
 * The engine outputs the rationale explains, plus the preferences both
 * engine steps consumed: the ranking (QTR-017) and the distribution
 * (QTR-018, QTR-019).
 */
export interface RationaleInput {
  preferences: TravelPreferences;
  ranking: ExperienceRanking;
  distribution: ExperienceDistribution;
}

/**
 * Maximum number of experience names listed in the interests line, so the
 * rationale stays brief (QTR-020).
 */
const MAX_NAMED_EXPERIENCES = 3;

// Local Spanish labels mirroring the wording the planner UI shows. They are
// kept local because the domain layer must not import client components,
// and neither the ranking nor the distribution module exports a label
// contract. Update both sides when the wording changes.
const INTEREST_LABELS: Record<Interest, string> = {
  archaeology: "Arqueología",
  history: "Historia",
  landscape: "Paisaje",
  nature: "Naturaleza",
  food: "Gastronomía",
  hiking: "Caminatas y senderismo",
  culture: "Cultura",
  photography: "Fotografía",
  crafts: "Artesanías",
  wellness: "Bienestar",
  astronomy: "Astronomía",
};

const MOBILITY_LABELS: Record<Mobility, string> = {
  without_car: "Sin auto",
  own_car: "Con auto propio",
  guided_excursions: "Excursiones guiadas",
  solar_train: "Tren Solar",
  mixed: "Combinada",
};

/** Joins a list the Spanish way: "a", "a y b", "a, b y c". */
function joinList(items: string[]): string {
  if (items.length <= 1) {
    return items.join("");
  }

  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

/**
 * Line that explains which experiences were prioritised for matching the
 * chosen interests, or `null` when nothing matched. It names at most
 * `MAX_NAMED_EXPERIENCES` experiences in ranking order and lists the
 * deduplicated union of the interests they matched, in order of appearance.
 */
function buildInterestLine(ranking: ExperienceRanking): string | null {
  const named = ranking.included
    .filter((scored) => scored.matchedInterests.length > 0)
    .slice(0, MAX_NAMED_EXPERIENCES);

  if (named.length === 0) {
    return null;
  }

  const interests: Interest[] = [];
  for (const { matchedInterests } of named) {
    for (const interest of matchedInterests) {
      if (!interests.includes(interest)) {
        interests.push(interest);
      }
    }
  }

  const names = named.map(({ experience }) => experience.name);
  const labels = interests.map((interest) => INTEREST_LABELS[interest]);
  const noun =
    interests.length === 1 ? "el interés elegido" : "los intereses elegidos";

  if (names.length === 1) {
    return `Se prioriza la actividad ${names[0]} por coincidir con ${noun}: ${joinList(labels)}.`;
  }

  return `Se priorizan actividades como ${joinList(names)} por coincidir con ${noun}: ${joinList(labels)}.`;
}

/** True when any day of the distribution contains a transfer block. */
function hasIntraDayTransfer(distribution: ExperienceDistribution): boolean {
  return distribution.days.some((day) =>
    day.blocks.some((block) => block.kind === "transfer"),
  );
}

/**
 * Builds the traveller-facing rationale of an itinerary (FR-16). Lines are
 * emitted in a stable order and only when the underlying data supports
 * them, so an empty engine output yields an empty rationale instead of a
 * generic placeholder:
 *
 * 1. experiences prioritised for matching the chosen interests;
 * 2. the pace caps applied to every day, when any day exists;
 * 3. the mobility constraint on intra-day transfers, when any exists;
 * 4. the ranking's hard-exclusion reasons, verbatim;
 * 5. the distribution's unscheduled reasons, verbatim.
 *
 * Distribution warnings are deliberately left out: they belong to
 * Itinerary.warnings, not to the rationale (QTR-021).
 */
export function buildRationale(input: RationaleInput): string[] {
  const lines: string[] = [];

  const interestLine = buildInterestLine(input.ranking);

  if (interestLine !== null) {
    lines.push(interestLine);
  }

  if (input.distribution.days.length > 0) {
    lines.push(
      "Cada día del itinerario respeta un tope de tiempo y de actividades según el ritmo elegido, para que el plan sea realista.",
    );
  }

  if (hasIntraDayTransfer(input.distribution)) {
    lines.push(
      `Los traslados dentro de un mismo día solo usan medios de transporte compatibles con la movilidad elegida (${MOBILITY_LABELS[input.preferences.mobility]}).`,
    );
  }

  for (const { reason } of input.ranking.excluded) {
    lines.push(reason);
  }

  for (const { reason } of input.distribution.unscheduled) {
    lines.push(reason);
  }

  return lines;
}
