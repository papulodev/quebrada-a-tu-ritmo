// One day of the itinerary summary (QTR-022).
//
// Server component: renders the blocks of one travel day in order with the
// destination category as context. Days without blocks stay visible instead
// of silently disappearing from the plan.

import type { ItineraryDay } from "../../planner/domain/types";

import { DESTINATION_CATEGORY_LABELS } from "../domain/presentation";
import { ItineraryBlockItem } from "./ItineraryBlockItem";

export function ItineraryDaySummary({ day }: { day: ItineraryDay }) {
  const headingId = `itinerary-day-${day.dayNumber}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 p-4"
    >
      <h3
        id={headingId}
        className="flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight"
      >
        <span>Día {day.dayNumber}</span>
        {day.destinationCategory !== null ? (
          <span className="badge badge-ghost badge-sm">
            {DESTINATION_CATEGORY_LABELS[day.destinationCategory]}
          </span>
        ) : null}
      </h3>

      {day.blocks.length === 0 ? (
        <p className="text-sm text-base-content/70">
          Sin actividades asignadas este día.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {day.blocks.map((block) => (
            <li key={block.id}>
              <ItineraryBlockItem block={block} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
