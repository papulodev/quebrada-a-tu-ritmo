// Curated destination catalogue (QTR-006).
//
// Facts here are deliberately conservative: no schedules, no prices, no
// coordinates and no visit lengths are asserted without a source. Every record
// is marked `needs_verification` until a human checks it against a primary
// source, so the UI shows the uncertainty instead of hiding it (FR-19..FR-22).

import type { Destination } from "./types";

export const DESTINATIONS = [
  {
    id: "dest-tilcara",
    slug: "tilcara",
    name: "Tilcara",
    description:
      "Localidad de la Quebrada de Humahuaca con patrimonio arqueológico y actividad cultural.",
    zone: "Quebrada de Humahuaca",
    category: "locality",
    estimatedVisitMinutes: null,
    latitude: null,
    longitude: null,
    active: true,
    source: null,
    confidence: "needs_verification",
  },
  {
    id: "dest-purmamarca",
    slug: "purmamarca",
    name: "Purmamarca",
    description:
      "Localidad de la Quebrada de Humahuaca, en el entorno del Cerro de los Siete Colores.",
    zone: "Quebrada de Humahuaca",
    category: "locality",
    estimatedVisitMinutes: null,
    latitude: null,
    longitude: null,
    active: true,
    source: null,
    confidence: "needs_verification",
  },
  {
    id: "dest-maimara",
    slug: "maimara",
    name: "Maimará",
    description:
      "Localidad de la Quebrada de Humahuaca, cercana a la formación conocida como Paleta del Pintor.",
    zone: "Quebrada de Humahuaca",
    category: "locality",
    estimatedVisitMinutes: null,
    latitude: null,
    longitude: null,
    active: true,
    source: null,
    confidence: "needs_verification",
  },
  {
    id: "dest-humahuaca",
    slug: "humahuaca",
    name: "Humahuaca",
    description:
      "Localidad del norte de la Quebrada de Humahuaca con centro histórico.",
    zone: "Quebrada de Humahuaca",
    category: "locality",
    estimatedVisitMinutes: null,
    latitude: null,
    longitude: null,
    active: true,
    source: null,
    confidence: "needs_verification",
  },
] as const satisfies readonly Destination[];

export type CuratedDestination = (typeof DESTINATIONS)[number];

export function findDestinationBySlug(
  slug: string,
): CuratedDestination | undefined {
  return DESTINATIONS.find((destination) => destination.slug === slug);
}
