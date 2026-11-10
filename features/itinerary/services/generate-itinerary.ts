// Itinerary generation service (QTR-021).
// Coordinates the use case: reads catalogue portions and passes them to the pure composition.

import {
  listDestinations,
  listExperiences,
  listTransportOptions,
} from "../../catalog/services/catalog-repository";
import type { StrategyId } from "../../planner/domain/select-strategies";
import type { Itinerary, TravelPreferences } from "../../planner/domain/types";
import { generateItinerary } from "../domain/generate-itinerary";

export async function generateItineraryFromCatalog(
  strategyId: StrategyId,
  preferences: TravelPreferences,
): Promise<Itinerary> {
  const [destinations, experiences, transportOptions] = await Promise.all([
    listDestinations(),
    listExperiences(),
    listTransportOptions(),
  ]);

  return generateItinerary({
    strategyId,
    preferences,
    catalog: { destinations, experiences, transportOptions },
  });
}
