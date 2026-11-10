// Itinerary distribution (QTR-018).
//
// Pure domain logic: no React, no database, no network. distributeExperiences
// takes the ranking produced by rankExperiences() and spreads its included
// experiences over the travel days of an already validated TravelPreferences,
// honouring the pace the traveller chose. It emits one ItineraryDay per travel
// day (visit blocks only): transfers (QTR-019), rationale (QTR-020) and the
// final Itinerary composition (QTR-021) are separate steps of the engine.

import { isKnownDuration } from "../../catalog/domain/confidence";
import type {
  Destination,
  DestinationCategory,
  Experience,
} from "../../catalog/domain/types";
import type {
  ItineraryBlock,
  ItineraryDay,
  Pace,
  TravelPreferences,
} from "../../planner/domain/types";
import type { ExperienceRanking } from "./rank-experiences";

/** An experience that did not fit into any travel day, with the reason why. */
export interface UnscheduledExperience {
  experience: Experience;
  reason: string;
}

/**
 * Distribution of ranked experiences across the days of a trip. `days` always
 * covers the whole trip (one entry per travel day, possibly empty); QTR-021
 * composes the final Itinerary from this shape plus transfers and rationale.
 */
export interface ExperienceDistribution {
  days: ItineraryDay[];
  warnings: string[];
  unscheduled: UnscheduledExperience[];
}

/**
 * Daily caps per pace. Unknown durations only count against `maxActivities`;
 * they never consume `budgetMinutes` and are never treated as zero.
 */
const PACE_DAY_LIMITS: Record<
  Pace,
  { maxActivities: number; budgetMinutes: number }
> = {
  relaxed: { maxActivities: 2, budgetMinutes: 240 },
  balanced: { maxActivities: 3, budgetMinutes: 360 },
  intensive: { maxActivities: 4, budgetMinutes: 480 },
};

/** Human-readable pace label used inside user-facing messages. */
const PACE_LABELS: Record<Pace, string> = {
  relaxed: "relajado",
  balanced: "equilibrado",
  intensive: "intensivo",
};

/** Mutable working state for one travel day while the distribution runs. */
interface DayDraft {
  dayNumber: number;
  blocks: ItineraryBlock[];
  usedMinutes: number;
  hasUnknownDuration: boolean;
}

function visitBlock(experience: Experience): ItineraryBlock {
  return {
    id: experience.id,
    kind: "visit",
    title: experience.name,
    destinationId: experience.destinationId,
    // Unknown duration is preserved as-is; it is never replaced with 0.
    estimatedDurationMinutes: experience.estimatedDurationMinutes,
    notes: null,
    confidence: experience.confidence,
  };
}

export function distributeExperiences(
  preferences: TravelPreferences,
  ranking: ExperienceRanking,
  destinations: readonly Destination[],
): ExperienceDistribution {
  // Upstream validation (QTR-011) owns the day range; this guard keeps the
  // failure explicit instead of leaking an opaque Array.from RangeError.
  if (!Number.isInteger(preferences.days) || preferences.days < 1) {
    throw new RangeError(
      `distributeExperiences requires at least one travel day (received ${preferences.days}). Validate preferences first (QTR-011).`,
    );
  }

  const { maxActivities, budgetMinutes } = PACE_DAY_LIMITS[preferences.pace];
  const paceLabel = PACE_LABELS[preferences.pace];

  const destinationCategories = new Map<string, DestinationCategory>(
    destinations.map(
      (destination): [string, DestinationCategory] => [
        destination.id,
        destination.category,
      ],
    ),
  );

  const days: DayDraft[] = Array.from(
    { length: preferences.days },
    (_, index) => ({
      dayNumber: index + 1,
      blocks: [],
      usedMinutes: 0,
      hasUnknownDuration: false,
    }),
  );

  const unscheduled: UnscheduledExperience[] = [];

  for (const { experience } of ranking.included) {
    const duration = experience.estimatedDurationMinutes;

    // A known duration longer than the daily budget cannot fit any day.
    if (isKnownDuration(duration) && duration > budgetMinutes) {
      unscheduled.push({
        experience,
        reason: `La duración estimada de ${experience.name} (${duration} minutos) no entra en un día con ritmo ${paceLabel}.`,
      });
      continue;
    }

    // Greedy first-fit: earliest day with room under both caps. Unknown
    // durations only respect the activity count cap, not the minute budget.
    const day = days.find(
      (candidate) =>
        candidate.blocks.length < maxActivities &&
        (!isKnownDuration(duration) ||
          candidate.usedMinutes + duration <= budgetMinutes),
    );

    if (day === undefined) {
      unscheduled.push({
        experience,
        reason: `No queda lugar para ${experience.name} en un viaje de ${
          preferences.days
        } ${preferences.days === 1 ? "día" : "días"} con ritmo ${paceLabel}.`,
      });
      continue;
    }

    day.blocks.push(visitBlock(experience));

    if (isKnownDuration(duration)) {
      day.usedMinutes += duration;
    } else {
      day.hasUnknownDuration = true;
    }
  }

  const warnings: string[] = [];

  if (days.some((day) => day.hasUnknownDuration)) {
    warnings.push(
      "Algunas actividades del itinerario no tienen duración estimada en el catálogo, así que el tiempo total de esos días no se puede confirmar.",
    );
  }

  if (days.some((day) => day.blocks.length === 0)) {
    warnings.push("Quedaron días del viaje sin actividades asignadas.");
  }

  const scheduledDays: ItineraryDay[] = days.map((day) => {
    const firstDestinationId = day.blocks[0]?.destinationId ?? null;
    const destinationCategory =
      firstDestinationId === null
        ? null
        : (destinationCategories.get(firstDestinationId) ?? null);

    return {
      dayNumber: day.dayNumber,
      destinationCategory,
      blocks: day.blocks,
    };
  });

  return { days: scheduledDays, warnings, unscheduled };
}
