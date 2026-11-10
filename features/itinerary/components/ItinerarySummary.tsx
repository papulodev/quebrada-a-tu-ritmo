// Itinerary summary (QTR-022).
//
// Server component: renders the generated itinerary in a scannable layout —
// the per-day plan, the activities that did not fit any day, the engine
// warnings and the rationale. Interactive wiring (fetching and selecting)
// belongs to QTR-023, so this tree stays server-rendered by design.

import type { Itinerary } from "../../planner/domain/types";

import { filterUnscheduledReasons } from "../domain/presentation";
import { ItineraryDaySummary } from "./ItineraryDaySummary";
import { ItineraryOptionalList } from "./ItineraryOptionalList";

export function ItinerarySummary({ itinerary }: { itinerary: Itinerary }) {
  // Each unscheduled reason is already shown in the optional activities
  // section, so the same text must not repeat under warnings.
  const warnings = filterUnscheduledReasons(
    itinerary.warnings,
    itinerary.unscheduled,
  );

  return (
    <section
      aria-label="Resumen del itinerario"
      className="flex flex-col gap-6"
    >
      <section
        aria-labelledby="itinerary-days-heading"
        className="flex flex-col gap-4"
      >
        <h2 id="itinerary-days-heading" className="text-lg font-semibold">
          Plan por día
        </h2>
        {itinerary.days.map((day) => (
          <ItineraryDaySummary key={day.dayNumber} day={day} />
        ))}
      </section>

      {itinerary.unscheduled.length > 0 ? (
        <section
          aria-labelledby="itinerary-optional-heading"
          className="flex flex-col gap-3"
        >
          <h2 id="itinerary-optional-heading" className="text-lg font-semibold">
            Actividades opcionales
          </h2>
          <ItineraryOptionalList items={itinerary.unscheduled} />
        </section>
      ) : null}

      {warnings.length > 0 ? (
        <section aria-labelledby="itinerary-warnings-heading">
          <h2 id="itinerary-warnings-heading" className="text-lg font-semibold">
            Advertencias
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-base-content/80">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="itinerary-rationale-heading">
        <h2
          id="itinerary-rationale-heading"
          className="text-lg font-semibold"
        >
          Cómo armamos este itinerario
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-base-content/80">
          {itinerary.rationale.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
