// Unscheduled activities list (QTR-022).
//
// Server component: ranked experiences that did not fit into any travel day,
// each with the engine's reason. They are presented as optional activities
// instead of disappearing from the response.

import type { UnscheduledExperience } from "../domain/distribute-experiences";

import { formatDuration } from "../domain/presentation";

export function ItineraryOptionalList({
  items,
}: {
  items: readonly UnscheduledExperience[];
}) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map(({ experience, reason }) => (
        <li key={experience.id} className="flex flex-col gap-1">
          <p className="font-medium">
            {experience.name}
            {experience.estimatedDurationMinutes !== null ? (
              <span className="ml-2 text-sm font-normal text-base-content/70">
                {formatDuration(experience.estimatedDurationMinutes)}
              </span>
            ) : null}
          </p>
          <p className="text-sm text-base-content/70">{reason}</p>
        </li>
      ))}
    </ul>
  );
}
