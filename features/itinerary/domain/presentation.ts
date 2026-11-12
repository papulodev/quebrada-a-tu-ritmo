// Presentation helpers for the itinerary summary (QTR-022).
//
// Pure formatting and filtering utilities shared by the itinerary summary
// components: no React, no database, no network. The label maps and badge
// styling intentionally duplicate the planner comparison card (NFR-02): the
// itinerary UI must not import planner components, so both copies have to
// stay in sync manually.

import type {
  ConfidenceStatus,
  SourceReference,
} from "../../catalog/domain/confidence";
import type { DestinationCategory } from "../../catalog/domain/types";
import type {
  Itinerary,
  ItineraryBlockKind,
} from "../../planner/domain/types";

const MINUTES_PER_HOUR = 60;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

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

/**
 * Formats an ISO date (`YYYY-MM-DD`) as `DD/MM/YYYY`. Returns `null` when the
 * value is not a real calendar date, so callers never render a made-up date.
 * The parts are parsed manually to avoid shifting the day across time zones.
 */
export function formatVerificationDate(isoDate: string): string | null {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (match === null) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const asUtc = new Date(Date.UTC(year, month - 1, day));

  if (
    asUtc.getUTCFullYear() !== year ||
    asUtc.getUTCMonth() !== month - 1 ||
    asUtc.getUTCDate() !== day
  ) {
    return null;
  }

  const paddedDay = String(day).padStart(2, "0");
  const paddedMonth = String(month).padStart(2, "0");
  return `${paddedDay}/${paddedMonth}/${String(year).padStart(4, "0")}`;
}

/**
 * Describes where a datum came from (FR-19). A missing source is stated
 * explicitly instead of being hidden, and a source without a verification date
 * says so rather than implying the datum is current.
 */
export function describeSource(source: SourceReference | null): string {
  if (source === null) {
    return "Sin fuente registrada";
  }

  const verifiedAt =
    source.verifiedAt === null ? null : formatVerificationDate(source.verifiedAt);

  return verifiedAt === null
    ? `Fuente: ${source.sourceName} · Fecha de verificación no registrada`
    : `Fuente: ${source.sourceName} · Verificado el ${verifiedAt}`;
}

/**
 * Notice shown once per itinerary when any of its data still needs verification
 * (FR-19). It is stated at the summary level because every affected block
 * already carries its own "Datos por confirmar" badge; repeating the full
 * paragraph on each block would bury the plan in warnings.
 */
export const UNVERIFIED_DATA_NOTICE =
  "Este itinerario incluye datos que todavía no están verificados. Conviene confirmar horarios y disponibilidad antes de viajar.";

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

/**
 * Tells whether any block of the itinerary still needs verification, so the
 * summary renders `UNVERIFIED_DATA_NOTICE` only when it is true (FR-19).
 */
export function hasUnverifiedBlocks(itinerary: Itinerary): boolean {
  return itinerary.days.some((day) =>
    day.blocks.some((block) => block.confidence === "needs_verification"),
  );
}
