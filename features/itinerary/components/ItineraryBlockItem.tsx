// One block of a day in the itinerary summary (QTR-022).
//
// Server component: a visit, transfer, meal or rest block with its kind,
// estimated duration and data confidence. Unknown durations are never shown
// as zero: they surface as an explicit pending note (FR-14), and confidence
// is always written out so it does not depend on colour alone (NFR-02).

import type { ItineraryBlock } from "../../planner/domain/types";

import {
  BLOCK_KIND_LABELS,
  CONFIDENCE_BADGES,
  formatDuration,
} from "../domain/presentation";

export function ItineraryBlockItem({ block }: { block: ItineraryBlock }) {
  const confidenceBadge = CONFIDENCE_BADGES[block.confidence];

  return (
    <article className="flex flex-col gap-2">
      <p className="font-medium">{block.title}</p>
      <p className="flex flex-wrap items-center gap-2">
        <span className="badge badge-ghost badge-sm">
          {BLOCK_KIND_LABELS[block.kind]}
        </span>
        <span className="text-sm text-base-content/70">
          {block.estimatedDurationMinutes !== null
            ? formatDuration(block.estimatedDurationMinutes)
            : "Duración por confirmar"}
        </span>
        <span className={`badge badge-sm ${confidenceBadge.className}`}>
          {confidenceBadge.label}
        </span>
      </p>
      {block.notes !== null ? (
        <p className="text-sm text-base-content/70">{block.notes}</p>
      ) : null}
    </article>
  );
}
