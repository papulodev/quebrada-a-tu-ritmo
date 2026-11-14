// Curated destination catalogue (QTR-006, QTR-029).
//
// Honesty rule: a non-null operational value (visit length, coordinates) must
// carry a source and a verification date. Records sourced from an interpretive
// document instead of a measured one stay `estimated`, so the UI shows the
// uncertainty instead of hiding it (FR-19..FR-22). Unknown values stay `null`,
// never `0`.

import type { Destination } from "./types";

export const DESTINATIONS = [
  {
    id: "dest-garganta-diablo",
    slug: "garganta-del-diablo",
    name: "Garganta del Diablo",
    description:
      "Cañón natural formado aguas arriba del río Huasamayo, al sudeste de Tilcara. El acceso combina camino vehicular o sendero; la visita requiere considerar el esfuerzo físico y las condiciones del cauce.",
    zone: "Entorno de Tilcara",
    category: "natural_area",
    estimatedVisitMinutes: 150,
    latitude: -23.593,
    longitude: -65.377,
    active: true,
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy — Manual para Guías Idóneos",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Manual-para-Guias-Idoneos_QUEBRADA_v5.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
  },
  {
    id: "dest-hornocal",
    slug: "serrania-hornocal",
    name: "Serranía del Hornocal",
    description:
      "Formación montañosa multicolor situada aproximadamente a 25 km de Humahuaca; el acceso al mirador se realiza por la Ruta Provincial 73, camino de montaña.",
    zone: "Quebrada de Humahuaca",
    category: "natural_area",
    estimatedVisitMinutes: 60,
    latitude: -23.22588,
    longitude: -65.20526,
    active: true,
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Catalogo-TRC-Rutas-73-y-83.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "dest-humahuaca",
    slug: "humahuaca",
    name: "Humahuaca",
    description:
      "Localidad histórica del norte de la Quebrada, con patrimonio urbano y acceso a la Serranía del Hornocal.",
    zone: "Quebrada de Humahuaca",
    category: "locality",
    estimatedVisitMinutes: 180,
    latitude: -23.204,
    longitude: -65.3488,
    active: true,
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Libro-Turismo.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "dest-maimara",
    slug: "maimara",
    name: "Maimará",
    description:
      "Pueblo de la Quebrada rodeado de cultivos y cerros policromados; su principal referencia paisajística es la Paleta del Pintor.",
    zone: "Quebrada de Humahuaca",
    category: "locality",
    estimatedVisitMinutes: 90,
    latitude: -23.6245,
    longitude: -65.4086,
    active: true,
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl: "https://www.turismo.jujuy.gob.ar/maimara/",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "dest-posta-hornillos",
    slug: "posta-de-hornillos",
    name: "Posta de Hornillos",
    description:
      "Posta histórica construida en 1772, vinculada al camino colonial y a las guerras de la independencia; conserva mobiliario y objetos de época.",
    zone: "Quebrada de Humahuaca",
    category: "landmark",
    estimatedVisitMinutes: 60,
    latitude: -23.654222,
    longitude: -65.431111,
    active: true,
    source: {
      sourceName: "Comisión de Filmaciones de Jujuy",
      sourceUrl:
        "https://comisiondefilmaciones.jujuy.gob.ar/locaciones/posta-de-hornillos/",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "dest-purmamarca",
    slug: "purmamarca",
    name: "Purmamarca",
    description:
      "Localidad de la Quebrada de Humahuaca reconocida por el Cerro de los Siete Colores, su plaza y el entorno de cerros multicolores.",
    zone: "Quebrada de Humahuaca",
    category: "locality",
    estimatedVisitMinutes: 120,
    latitude: -23.7466,
    longitude: -65.4992,
    active: true,
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Libro-Turismo.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "dest-salinas-grandes",
    slug: "salinas-grandes",
    name: "Salinas Grandes",
    description:
      "Gran salar de altura de la región de la Puna, visitado habitualmente como excursión desde Purmamarca por la Cuesta de Lipán.",
    zone: "Puna (excursión desde la Quebrada)",
    category: "natural_area",
    estimatedVisitMinutes: 90,
    latitude: -23.6,
    longitude: -65.95,
    active: true,
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Catalogo-Internacional-Ingles.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
  },
  {
    id: "dest-tilcara",
    slug: "tilcara",
    name: "Tilcara",
    description:
      "Localidad de la Quebrada que reúne patrimonio arqueológico, vida cultural y acceso a senderos y paisajes de montaña.",
    zone: "Quebrada de Humahuaca",
    category: "locality",
    estimatedVisitMinutes: 180,
    latitude: -23.5769,
    longitude: -65.3934,
    active: true,
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Libro-Turismo.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "dest-tumbaya",
    slug: "tumbaya",
    name: "Tumbaya",
    description:
      "Localidad de la Quebrada incluida entre las paradas del recorrido del Tren Solar.",
    zone: "Quebrada de Humahuaca",
    category: "locality",
    estimatedVisitMinutes: 45,
    latitude: -23.85755,
    longitude: -65.46702,
    active: true,
    source: {
      sourceName: "Tren Solar de la Quebrada",
      sourceUrl: "https://trensolar.com.ar/",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "dest-uquia",
    slug: "uquia",
    name: "Uquía",
    description:
      "Localidad de la Quebrada conocida por su iglesia histórica y su patrimonio cultural.",
    zone: "Quebrada de Humahuaca",
    category: "locality",
    estimatedVisitMinutes: 60,
    latitude: -23.303,
    longitude: -65.3557,
    active: true,
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Libro-Turismo.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "dest-volcan",
    slug: "volcan",
    name: "Volcán",
    description:
      "Localidad del extremo sur del corredor ferroviario del Tren Solar de la Quebrada.",
    zone: "Quebrada de Humahuaca",
    category: "locality",
    estimatedVisitMinutes: 45,
    latitude: -23.9171,
    longitude: -65.46402,
    active: true,
    source: {
      sourceName: "Tren Solar de la Quebrada",
      sourceUrl: "https://trensolar.com.ar/",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
] as const satisfies readonly Destination[];

export type CuratedDestination = (typeof DESTINATIONS)[number];

export function findDestinationBySlug(
  slug: string,
): CuratedDestination | undefined {
  return DESTINATIONS.find((destination) => destination.slug === slug);
}
