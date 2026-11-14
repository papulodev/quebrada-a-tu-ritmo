// Unscheduled activities list (QTR-022).
//
// Server component: ranked experiences that did not fit into any travel day,
// each with the engine's reason. They are presented as optional activities
// instead of disappearing from the response. Their confidence and provenance
// are shown like any other datum (FR-19): the badge carries the status and
// `describeSource` states the source, so an unverified experience never looks
// like confirmed information.

import type { UnscheduledExperience } from "../domain/distribute-experiences";

import {
  CONFIDENCE_BADGES,
  describeSource,
  formatDuration,
} from "../domain/presentation";

export function ItineraryOptionalList({
  items,
}: {
  items: readonly UnscheduledExperience[];
}) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map(({ experience, reason }) => {
        const confidenceBadge = CONFIDENCE_BADGES[experience.confidence];

        return (
          <li key={experience.id} className="flex flex-col gap-1">
            <p className="flex flex-wrap items-center gap-2 font-medium">
              {experience.name}
              {experience.estimatedDurationMinutes !== null ? (
                <span className="text-sm font-normal text-base-content/70">
                  {formatDuration(experience.estimatedDurationMinutes)}
                </span>
              ) : null}
              <span className={`badge badge-sm ${confidenceBadge.className}`}>
                {confidenceBadge.label}
              </span>
            </p>
            <p className="text-sm text-base-content/70">{reason}</p>
            <p className="text-sm text-base-content/70">
              {describeSource(experience.source)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
