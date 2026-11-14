// Curated transport catalogue (QTR-029).
//
// Only corridors confirmed by the operator are listed. Travel times and
// fares are unknown, so they stay `null`, never `0`; the UI must show the
// corridor as verified while flagging the missing duration and price.

import type { TransportOption } from "./types";

export const TRANSPORT_OPTIONS = [
  {
    id: "tr-maimara-tilcara",
    originDestinationId: "dest-maimara",
    destinationDestinationId: "dest-tilcara",
    mode: "solar_train",
    estimatedDurationMinutes: null,
    priceMin: null,
    priceMax: null,
    currency: "ARS",
    scheduleNotes:
      "Tramo entre estaciones del recorrido del Tren Solar. Consultar calendario, horarios y disponibilidad oficiales para la fecha elegida.",
    source: {
      sourceName: "Tren Solar de la Quebrada",
      sourceUrl: "https://trensolar.com.ar/",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "tr-posta-hornillos-maimara",
    originDestinationId: "dest-posta-hornillos",
    destinationDestinationId: "dest-maimara",
    mode: "solar_train",
    estimatedDurationMinutes: null,
    priceMin: null,
    priceMax: null,
    currency: "ARS",
    scheduleNotes:
      "Tramo del circuito 360° del Tren Solar. No se asume frecuencia, horario ni tarifa fija; verificar el itinerario vigente para la fecha del viaje.",
    source: {
      sourceName: "Tren Solar de la Quebrada",
      sourceUrl: "https://trensolar.com.ar/experiencia-360/",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "tr-purmamarca-posta-hornillos",
    originDestinationId: "dest-purmamarca",
    destinationDestinationId: "dest-posta-hornillos",
    mode: "solar_train",
    estimatedDurationMinutes: null,
    priceMin: null,
    priceMax: null,
    currency: "ARS",
    scheduleNotes:
      "La Posta de Hornillos figura como parada del circuito de la Experiencia 360°. Confirmar que la parada esté incluida en la salida seleccionada.",
    source: {
      sourceName: "Tren Solar de la Quebrada",
      sourceUrl: "https://trensolar.com.ar/experiencia-360/",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "tr-tumbaya-purmamarca",
    originDestinationId: "dest-tumbaya",
    destinationDestinationId: "dest-purmamarca",
    mode: "solar_train",
    estimatedDurationMinutes: null,
    priceMin: null,
    priceMax: null,
    currency: "ARS",
    scheduleNotes:
      "Tramo entre estaciones del recorrido del Tren Solar. La estación de Purmamarca corresponde al empalme; confirmar detalles del servicio y horarios para la fecha elegida.",
    source: {
      sourceName: "Tren Solar de la Quebrada",
      sourceUrl: "https://trensolar.com.ar/experiencia-360/",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "tr-volcan-tumbaya",
    originDestinationId: "dest-volcan",
    destinationDestinationId: "dest-tumbaya",
    mode: "solar_train",
    estimatedDurationMinutes: null,
    priceMin: null,
    priceMax: null,
    currency: "ARS",
    scheduleNotes:
      "Tramo entre estaciones del recorrido del Tren Solar. No se cargan horarios ni tarifas: consultar disponibilidad y servicio para la fecha elegida en el sitio oficial.",
    source: {
      sourceName: "Tren Solar de la Quebrada",
      sourceUrl: "https://trensolar.com.ar/experiencia-360/",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
] as const satisfies readonly TransportOption[];

export type CuratedTransportOption = (typeof TRANSPORT_OPTIONS)[number];

export function findTransportOptionById(
  id: string,
): CuratedTransportOption | undefined {
  return TRANSPORT_OPTIONS.find((option) => option.id === id);
}
