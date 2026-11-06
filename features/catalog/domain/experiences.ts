// Curated experience catalogue (QTR-007).
//
// Same honesty rule as destinations: no asserted durations, prices, schedules
// or availability. Unknown values stay `null` and every record is pending
// verification until a human checks it against a primary source.

import type { Experience } from "./types";

export const EXPERIENCES = [
  {
    id: "exp-pucara-de-tilcara",
    destinationId: "dest-tilcara",
    name: "Pucará de Tilcara",
    category: "archaeological_site",
    interests: ["archaeology", "history"],
    estimatedDurationMinutes: null,
    budgetLevel: null,
    description:
      "Sitio arqueológico prehispánico en el entorno de Tilcara.",
    source: null,
    confidence: "needs_verification",
  },
  {
    id: "exp-caminata-tilcara",
    destinationId: "dest-tilcara",
    name: "Caminata por el pueblo",
    category: "walk",
    interests: ["landscape", "culture"],
    estimatedDurationMinutes: null,
    budgetLevel: null,
    description:
      "Recorrido a pie por las calles y espacios públicos de Tilcara.",
    source: null,
    confidence: "needs_verification",
  },
  {
    id: "exp-cerro-siete-colores",
    destinationId: "dest-purmamarca",
    name: "Cerro de los Siete Colores",
    category: "viewpoint",
    interests: ["landscape", "photography"],
    estimatedDurationMinutes: null,
    budgetLevel: null,
    description:
      "Mirador natural sobre la formación conocida como Cerro de los Siete Colores.",
    source: null,
    confidence: "needs_verification",
  },
  {
    id: "exp-feria-artesanos-purma",
    destinationId: "dest-purmamarca",
    name: "Feria de artesanos",
    category: "market",
    interests: ["crafts", "culture"],
    estimatedDurationMinutes: null,
    budgetLevel: null,
    description:
      "Puestos de artesanías en la localidad de Purmamarca; horarios sin confirmar.",
    source: null,
    confidence: "needs_verification",
  },
  {
    id: "exp-paleta-del-pintor",
    destinationId: "dest-maimara",
    name: "Paleta del Pintor",
    category: "viewpoint",
    interests: ["landscape", "photography"],
    estimatedDurationMinutes: null,
    budgetLevel: null,
    description:
      "Formación de cerros con franjas de color en el entorno de Maimará.",
    source: null,
    confidence: "needs_verification",
  },
  {
    id: "exp-centro-historico-humahuaca",
    destinationId: "dest-humahuaca",
    name: "Centro histórico de Humahuaca",
    category: "historic_center",
    interests: ["history", "culture"],
    estimatedDurationMinutes: null,
    budgetLevel: null,
    description:
      "Recorrido por el casco histórico de Humahuaca y sus edificios emblemáticos.",
    source: null,
    confidence: "needs_verification",
  },
] as const satisfies readonly Experience[];

export type CuratedExperience = (typeof EXPERIENCES)[number];

export function findExperiencesByDestination(
  destinationId: string,
): CuratedExperience[] {
  return EXPERIENCES.filter(
    (experience) => experience.destinationId === destinationId,
  );
}
