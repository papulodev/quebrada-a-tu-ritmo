// Plain-text itinerary summary (QTR-025).
//
// Pure text builder shared by the copy action: no React, no DOM, no network.
// It mirrors the itinerary summary layout so the traveller can paste the plan
// into a message and still see the same information. Estimates never become
// facts here (FR-19, NFR-08): every line states the confidence of its data and
// the closing note repeats that durations and availability are not confirmed.

import type { ConfidenceStatus } from "../../catalog/domain/confidence";
import type {
  Itinerary,
  ItineraryBlock,
  ItineraryDay,
} from "../../planner/domain/types";
import type { UnscheduledExperience } from "./distribute-experiences";

import {
  BLOCK_KIND_LABELS,
  CONFIDENCE_BADGES,
  DESTINATION_CATEGORY_LABELS,
  filterUnscheduledReasons,
  formatDuration,
  hasUnverifiedBlocks,
  UNVERIFIED_DATA_NOTICE,
} from "./presentation";

const SUMMARY_TITLE = "Resumen del itinerario — Quebrada a tu ritmo";

/**
 * Closing note used when every block is already verified. The plan is still a
 * proposal: durations are engine estimates and availability is never checked.
 */
const ESTIMATE_ONLY_NOTICE =
  "Las duraciones son estimaciones del planificador y no confirman horarios ni disponibilidad de transporte.";

export interface SummaryTextOptions {
  /** Human-readable name of the chosen strategy, when the caller knows it. */
  strategyName?: string | null;
}

function describeDuration(minutes: number | null): string {
  return minutes === null
    ? "duración por confirmar"
    : `duración estimada ${formatDuration(minutes)}`;
}

function describeConfidence(confidence: ConfidenceStatus): string {
  return CONFIDENCE_BADGES[confidence].label;
}

function dayHeading(day: ItineraryDay): string {
  const heading = `Día ${day.dayNumber}`;
  return day.destinationCategory === null
    ? heading
    : `${heading} — ${DESTINATION_CATEGORY_LABELS[day.destinationCategory]}`;
}

function blockLine(block: ItineraryBlock): string {
  return [
    `- ${BLOCK_KIND_LABELS[block.kind]}: ${block.title}`,
    describeDuration(block.estimatedDurationMinutes),
    describeConfidence(block.confidence),
  ].join(" · ");
}

function optionalLine({ experience, reason }: UnscheduledExperience): string {
  const parts = [experience.name];
  if (experience.estimatedDurationMinutes !== null) {
    parts.push(describeDuration(experience.estimatedDurationMinutes));
  }
  parts.push(describeConfidence(experience.confidence));
  return `- ${parts.join(" · ")} — ${reason}`;
}

function closingNotice(itinerary: Itinerary): string {
  return hasUnverifiedBlocks(itinerary)
    ? UNVERIFIED_DATA_NOTICE
    : ESTIMATE_ONLY_NOTICE;
}

/**
 * Builds the copyable summary: days and their main activities, the activities
 * that did not fit any day, the engine warnings that are not already explained
 * there, and a closing note about pending data.
 */
export function buildSummaryText(
  itinerary: Itinerary,
  options: SummaryTextOptions = {},
): string {
  const lines: string[] = [SUMMARY_TITLE];

  const strategyName = options.strategyName?.trim() ?? "";
  if (strategyName.length > 0) {
    lines.push(`Estrategia: ${strategyName}`);
  }

  for (const day of itinerary.days) {
    lines.push("", dayHeading(day));
    if (day.blocks.length === 0) {
      lines.push("Sin actividades asignadas este día.");
      continue;
    }
    for (const block of day.blocks) {
      lines.push(blockLine(block));
    }
  }

  if (itinerary.unscheduled.length > 0) {
    lines.push("", "Actividades opcionales");
    for (const item of itinerary.unscheduled) {
      lines.push(optionalLine(item));
    }
  }

  // Each unscheduled reason is already written next to its activity, so the
  // same sentence must not repeat under warnings.
  const warnings = filterUnscheduledReasons(
    itinerary.warnings,
    itinerary.unscheduled,
  );
  if (warnings.length > 0) {
    lines.push("", "Advertencias");
    for (const warning of warnings) {
      lines.push(`- ${warning}`);
    }
  }

  lines.push("", closingNotice(itinerary));

  return lines.join("\n");
}
