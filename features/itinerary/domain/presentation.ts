// Presentation helpers for the itinerary summary (QTR-022).
//
// Pure formatting and filtering utilities shared by the itinerary summary
// components: no React, no database, no network. The label maps and badge
// styling intentionally duplicate the planner comparison card (NFR-02): the
// itinerary UI must not import planner components, so both copies have to
// stay in sync manually.

import type { ConfidenceStatus } from "../../catalog/domain/confidence";
import type { DestinationCategory } from "../../catalog/domain/types";
import type { ItineraryBlockKind } from "../../planner/domain/types";

const MINUTES_PER_HOUR = 60;

/** Formats a known duration in minutes as "1 h 30 min". */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new RangeError("minutes must be a finite non-negative number");
  }

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const remainingMinutes = minutes % MINUTES_PER_HOUR;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours} h`);
  }
  if (remainingMinutes > 0 || hours === 0) {
    parts.push(`${remainingMinutes} min`);
  }
  return parts.join(" ");
}

/** UI labels for each itinerary block kind. */
export const BLOCK_KIND_LABELS: Record<ItineraryBlockKind, string> = {
  visit: "Visita",
  transfer: "Traslado",
  meal: "Comida",
  rest: "Descanso",
};

/** UI labels for the destination category of a day. */
export const DESTINATION_CATEGORY_LABELS: Record<
  DestinationCategory,
  string
> = {
  locality: "Localidad",
  attraction: "Atracción",
  natural_area: "Área natural",
  landmark: "Hito",
};

interface ConfidenceBadge {
  label: string;
  className: string;
}

/**
 * Mirror of the confidence badges in StrategyCard (NFR-02): the itinerary
 * summary keeps its own copy so planner and itinerary presentations stay
 * independent. Keep both in sync when the wording changes.
 */
export const CONFIDENCE_BADGES: Record<ConfidenceStatus, ConfidenceBadge> = {
  verified: { label: "Dato verificado", className: "badge-success" },
  estimated: { label: "Dato estimado", className: "badge-info" },
  needs_verification: {
    label: "Datos por confirmar",
    className: "badge-warning",
  },
};

/**
 * Removes the per-experience reasons that the optional activities section
 * already shows, so the same message is not listed twice in the summary.
 */
export function filterUnscheduledReasons(
  warnings: readonly string[],
  unscheduled: readonly { reason: string }[],
): string[] {
  const unscheduledReasons = new Set(unscheduled.map((item) => item.reason));
  return warnings.filter((warning) => !unscheduledReasons.has(warning));
}
