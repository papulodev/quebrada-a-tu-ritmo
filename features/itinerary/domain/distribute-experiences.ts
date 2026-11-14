// Itinerary distribution (QTR-018, QTR-019).
//
// Pure domain logic: no React, no database, no network. distributeExperiences
// takes the ranking produced by rankExperiences() and spreads its included
// experiences over the travel days of an already validated TravelPreferences,
// honouring the pace the traveller chose. Between two consecutive visits of
// the same day that sit at different destinations it inserts a transfer
// block (QTR-019), chosen from the transport options allowed by the
// traveller's mobility.
//
// Transfer scope is intra-day only: reaching the first destination of a day
// or switching the lodging base depends on the travel strategy, so it stays
// out of this module. A transfer without a known duration is never assumed to
// take zero minutes; it is flagged for verification instead (FR-10, FR-14).
// Rationale (QTR-020) and the final Itinerary composition (QTR-021) remain
// separate steps of the engine.

import { isKnownDuration, type ConfidenceStatus } from "../../catalog/domain/confidence";
import {
  TRANSPORT_MODES,
  type Destination,
  type DestinationCategory,
  type Experience,
  type TransportMode,
  type TransportOption,
} from "../../catalog/domain/types";
import type {
  ItineraryBlock,
  ItineraryDay,
  Mobility,
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
 * composes the final Itinerary from this shape plus rationale.
 */
export interface ExperienceDistribution {
  days: ItineraryDay[];
  warnings: string[];
  unscheduled: UnscheduledExperience[];
}

/**
 * Daily caps per pace. `maxActivities` counts visits only: transfer blocks
 * never consume it. Known visit and transfer minutes count against
 * `budgetMinutes`; unknown durations never do, and are never treated as zero.
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

/** Human-readable transport mode labels (es-AR) for transfer titles. */
const MODE_LABELS: Record<TransportMode, string> = {
  bus: "colectivo",
  solar_train: "tren solar",
  guided_excursion: "excursión guiada",
  car: "auto",
  walk: "caminata",
  mixed: "combinado",
};

/**
 * Transport modes each mobility may use for an intra-day transfer. When no
 * option matches the mobility, the transfer stays unknown instead of falling
 * back to an incompatible mode.
 */
const MOBILITY_MODES: Record<Mobility, ReadonlySet<TransportMode>> = {
  without_car: new Set(TRANSPORT_MODES.filter((mode) => mode !== "car")),
  own_car: new Set<TransportMode>(["car"]),
  guided_excursions: new Set<TransportMode>(["guided_excursion"]),
  solar_train: new Set<TransportMode>(["solar_train"]),
  mixed: new Set(TRANSPORT_MODES),
};

/** Mutable working state for one travel day while the distribution runs. */
interface DayDraft {
  dayNumber: number;
  blocks: ItineraryBlock[];
  usedMinutes: number;
  hasUnknownDuration: boolean;
  /** Number of visit blocks; transfers never count towards `maxActivities`. */
  visitCount: number;
  /** Destination of the last scheduled visit, used to pair intra-day transfers. */
  lastDestinationId: string | null;
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
    source: experience.source,
    confidence: experience.confidence,
  };
}

/** Lookup key for the directional pair origin -> destination. */
function transferKey(originId: string, destinationId: string): string {
  return `${originId}->${destinationId}`;
}

/**
 * Picks the option used for a transfer: only modes allowed by the mobility
 * are considered, known durations win, and ties keep declaration order.
 */
function selectTransferOption(
  options: readonly TransportOption[],
  allowedModes: ReadonlySet<TransportMode>,
): TransportOption | null {
  const compatible = options.filter((option) => allowedModes.has(option.mode));

  if (compatible.length === 0) {
    return null;
  }

  const timed = compatible.filter((option) =>
    isKnownDuration(option.estimatedDurationMinutes),
  );

  return timed.length > 0 ? timed[0] : compatible[0];
}

function transferBlock(
  sequence: number,
  originName: string,
  arrivalDestinationId: string,
  arrivalName: string,
  option: TransportOption | null,
): ItineraryBlock {
  let estimatedDurationMinutes: number | null = null;
  let confidence: ConfidenceStatus = "needs_verification";

  if (option !== null && isKnownDuration(option.estimatedDurationMinutes)) {
    estimatedDurationMinutes = option.estimatedDurationMinutes;
    confidence = option.confidence;
  }

  return {
    id: `transfer-${sequence}`,
    kind: "transfer",
    title:
      option === null
        ? `Traslado de ${originName} a ${arrivalName}`
        : `Traslado en ${MODE_LABELS[option.mode]} de ${originName} a ${arrivalName}`,
    destinationId: arrivalDestinationId,
    estimatedDurationMinutes,
    notes: option?.scheduleNotes ?? null,
    source: option?.source ?? null,
    confidence,
  };
}

export function distributeExperiences(
  preferences: TravelPreferences,
  ranking: ExperienceRanking,
  destinations: readonly Destination[],
  transportOptions: readonly TransportOption[],
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
  const allowedModes = MOBILITY_MODES[preferences.mobility];

  const destinationCategories = new Map<string, DestinationCategory>(
    destinations.map(
      (destination): [string, DestinationCategory] => [
        destination.id,
        destination.category,
      ],
    ),
  );
  const destinationNames = new Map<string, string>(
    destinations.map(
      (destination): [string, string] => [destination.id, destination.name],
    ),
  );
  const nameOf = (destinationId: string): string =>
    destinationNames.get(destinationId) ?? destinationId;

  const optionsByPair = new Map<string, TransportOption[]>();
  for (const option of transportOptions) {
    const key = transferKey(
      option.originDestinationId,
      option.destinationDestinationId,
    );
    const existing = optionsByPair.get(key);

    if (existing === undefined) {
      optionsByPair.set(key, [option]);
    } else {
      existing.push(option);
    }
  }

  const days: DayDraft[] = Array.from(
    { length: preferences.days },
    (_, index) => ({
      dayNumber: index + 1,
      blocks: [],
      usedMinutes: 0,
      hasUnknownDuration: false,
      visitCount: 0,
      lastDestinationId: null,
    }),
  );

  const unscheduled: UnscheduledExperience[] = [];
  const warnedPairs = new Set<string>();
  const transferWarnings: string[] = [];
  let transferSequence = 0;

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

    // Greedy first-fit: earliest day with room under both caps. Transfers
    // pair consecutive visits of the same day at different destinations.
    // Unknown visit or transfer durations never consume the minute budget
    // (unknown is never zero) and only respect the activity cap.
    let target: DayDraft | undefined;
    let transferOriginId: string | null = null;
    let transferOption: TransportOption | null = null;

    for (const candidate of days) {
      const previousDestinationId = candidate.lastDestinationId;
      const needsTransfer =
        previousDestinationId !== null &&
        previousDestinationId !== experience.destinationId;

      const candidateOption = needsTransfer
        ? selectTransferOption(
            optionsByPair.get(
              transferKey(previousDestinationId, experience.destinationId),
            ) ?? [],
            allowedModes,
          )
        : null;

      const transferMinutes =
        candidateOption !== null &&
        isKnownDuration(candidateOption.estimatedDurationMinutes)
          ? candidateOption.estimatedDurationMinutes
          : 0;
      const visitMinutes = isKnownDuration(duration) ? duration : 0;
      const minutesToFit = visitMinutes + transferMinutes;

      if (
        candidate.visitCount < maxActivities &&
        (minutesToFit === 0 ||
          candidate.usedMinutes + minutesToFit <= budgetMinutes)
      ) {
        target = candidate;
        transferOriginId = needsTransfer ? previousDestinationId : null;
        transferOption = candidateOption;
        break;
      }
    }

    if (target === undefined) {
      unscheduled.push({
        experience,
        reason: `No queda lugar para ${experience.name} en un viaje de ${
          preferences.days
        } ${preferences.days === 1 ? "día" : "días"} con ritmo ${paceLabel}.`,
      });
      continue;
    }

    if (transferOriginId !== null) {
      transferSequence += 1;
      target.blocks.push(
        transferBlock(
          transferSequence,
          nameOf(transferOriginId),
          experience.destinationId,
          nameOf(experience.destinationId),
          transferOption,
        ),
      );

      if (
        transferOption !== null &&
        isKnownDuration(transferOption.estimatedDurationMinutes)
      ) {
        // Known transfer minutes consume the daily budget like visit minutes.
        target.usedMinutes += transferOption.estimatedDurationMinutes;
      } else {
        const pairKey = transferKey(
          transferOriginId,
          experience.destinationId,
        );

        if (!warnedPairs.has(pairKey)) {
          warnedPairs.add(pairKey);
          transferWarnings.push(
            `El traslado de ${nameOf(transferOriginId)} a ${nameOf(
              experience.destinationId,
            )} no tiene duración confirmada en el catálogo, así que esa combinación de actividades no se puede declarar confirmada.`,
          );
        }
      }
    }

    target.blocks.push(visitBlock(experience));

    if (isKnownDuration(duration)) {
      target.usedMinutes += duration;
    } else {
      target.hasUnknownDuration = true;
    }

    target.visitCount += 1;
    target.lastDestinationId = experience.destinationId;
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

  warnings.push(...transferWarnings);

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
