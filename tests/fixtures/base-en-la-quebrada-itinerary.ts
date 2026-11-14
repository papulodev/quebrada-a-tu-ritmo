import type { Itinerary } from "../../features/planner/domain/types";

/**
 * Deterministic itinerary used by the end-to-end planner flow.
 *
 * It mirrors a real `POST /api/itineraries` response for the
 * "base-en-la-quebrada" strategy so the browser test does not depend on a
 * seeded database or the scheduler. `planner-flow.spec.ts` validates it with
 * `validateItineraryResponse` to keep it aligned with the domain contract.
 */
export const baseEnLaQuebradaItinerary: Itinerary = {
  strategyId: "base-en-la-quebrada",
  days: [
    {
      dayNumber: 1,
      destinationCategory: "locality",
      blocks: [
        {
          id: "exp-caminata-tilcara",
          kind: "visit",
          title: "Caminata por el pueblo",
          destinationId: "dest-tilcara",
          estimatedDurationMinutes: null,
          notes: null,
          source: null,
          confidence: "needs_verification",
        },
        {
          id: "transfer-1",
          kind: "transfer",
          title: "Traslado de Tilcara a Purmamarca",
          destinationId: "dest-purmamarca",
          estimatedDurationMinutes: null,
          notes: null,
          source: null,
          confidence: "needs_verification",
        },
        {
          id: "exp-cerro-siete-colores",
          kind: "visit",
          title: "Cerro de los Siete Colores",
          destinationId: "dest-purmamarca",
          estimatedDurationMinutes: null,
          notes: null,
          source: null,
          confidence: "needs_verification",
        },
        {
          id: "transfer-2",
          kind: "transfer",
          title: "Traslado de Purmamarca a Maimará",
          destinationId: "dest-maimara",
          estimatedDurationMinutes: null,
          notes: null,
          source: null,
          confidence: "needs_verification",
        },
        {
          id: "exp-paleta-del-pintor",
          kind: "visit",
          title: "Paleta del Pintor",
          destinationId: "dest-maimara",
          estimatedDurationMinutes: null,
          notes: null,
          source: null,
          confidence: "needs_verification",
        },
      ],
    },
    {
      dayNumber: 2,
      destinationCategory: "locality",
      blocks: [
        {
          id: "exp-centro-historico-humahuaca",
          kind: "visit",
          title: "Centro histórico de Humahuaca",
          destinationId: "dest-humahuaca",
          estimatedDurationMinutes: null,
          notes: null,
          source: null,
          confidence: "needs_verification",
        },
        {
          id: "transfer-3",
          kind: "transfer",
          title: "Traslado de Humahuaca a Purmamarca",
          destinationId: "dest-purmamarca",
          estimatedDurationMinutes: null,
          notes: null,
          source: null,
          confidence: "needs_verification",
        },
        {
          id: "exp-feria-artesanos-purma",
          kind: "visit",
          title: "Feria de artesanos",
          destinationId: "dest-purmamarca",
          estimatedDurationMinutes: null,
          notes: null,
          source: null,
          confidence: "needs_verification",
        },
        {
          id: "transfer-4",
          kind: "transfer",
          title: "Traslado de Purmamarca a Tilcara",
          destinationId: "dest-tilcara",
          estimatedDurationMinutes: null,
          notes: null,
          source: null,
          confidence: "needs_verification",
        },
        {
          id: "exp-pucara-de-tilcara",
          kind: "visit",
          title: "Pucará de Tilcara",
          destinationId: "dest-tilcara",
          estimatedDurationMinutes: null,
          notes: null,
          source: null,
          confidence: "needs_verification",
        },
      ],
    },
    {
      dayNumber: 3,
      destinationCategory: null,
      blocks: [],
    },
  ],
  rationale: [
    "Se priorizan actividades como Caminata por el pueblo, Cerro de los Siete Colores y Paleta del Pintor por coincidir con el interés elegido: Paisaje.",
    "Cada día del itinerario respeta un tope de tiempo y de actividades según el ritmo elegido, para que el plan sea realista.",
    "Los traslados dentro de un mismo día solo usan medios de transporte compatibles con la movilidad elegida (Sin auto).",
  ],
  warnings: [
    "Algunas actividades del itinerario no tienen duración estimada en el catálogo, así que el tiempo total de esos días no se puede confirmar.",
    "Quedaron días del viaje sin actividades asignadas.",
    "El traslado de Tilcara a Purmamarca no tiene duración confirmada en el catálogo, así que esa combinación de actividades no se puede declarar confirmada.",
    "El traslado de Purmamarca a Maimará no tiene duración confirmada en el catálogo, así que esa combinación de actividades no se puede declarar confirmada.",
    "El traslado de Humahuaca a Purmamarca no tiene duración confirmada en el catálogo, así que esa combinación de actividades no se puede declarar confirmada.",
    "El traslado de Purmamarca a Tilcara no tiene duración confirmada en el catálogo, así que esa combinación de actividades no se puede declarar confirmada.",
  ],
  unscheduled: [],
};
