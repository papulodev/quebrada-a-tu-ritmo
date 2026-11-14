// Curated experience catalogue (QTR-007, QTR-029).
//
// Honesty rule: a non-null duration or budget level must carry a source
// and a verification date. Records sourced from an interpretive document
// stay `estimated`, so the UI shows the uncertainty instead of hiding it
// (FR-19..FR-22). Unknown values stay `null`, never `0`.

import type { Experience } from "./types";

export const EXPERIENCES = [
  {
    id: "exp-caminata-tilcara",
    destinationId: "dest-tilcara",
    name: "Caminata por Tilcara",
    category: "walk",
    interests: ["culture", "history", "food", "photography"],
    estimatedDurationMinutes: 60,
    budgetLevel: "low",
    description:
      "Recorrido libre a pie por el pueblo para conocer su plaza, calles, comercios y espacios culturales. Duración orientativa.",
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Libro-Turismo.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
  },
  {
    id: "exp-centro-historico-humahuaca",
    destinationId: "dest-humahuaca",
    name: "Centro histórico de Humahuaca",
    category: "historic_center",
    interests: ["history", "culture", "photography"],
    estimatedDurationMinutes: 75,
    budgetLevel: "low",
    description:
      "Recorrido a pie por el casco histórico y sus espacios patrimoniales. La duración es orientativa y no incluye visitas guiadas.",
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Libro-Turismo.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
  },
  {
    id: "exp-cerro-siete-colores",
    destinationId: "dest-purmamarca",
    name: "Cerro de los Siete Colores",
    category: "viewpoint",
    interests: ["landscape", "nature", "photography"],
    estimatedDurationMinutes: 30,
    budgetLevel: "low",
    description:
      "Vista del cerro multicolor que caracteriza el paisaje de Purmamarca. El tiempo depende del punto de observación y del recorrido elegido.",
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Libro-Turismo.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
  },
  {
    id: "exp-el-porito",
    destinationId: "dest-purmamarca",
    name: "Mirador El Porito",
    category: "viewpoint",
    interests: ["landscape", "photography"],
    estimatedDurationMinutes: 30,
    budgetLevel: "low",
    description:
      "Pequeño ascenso por escalera a un mirador con vista del pueblo de Purmamarca y el Cerro de los Siete Colores.",
    source: {
      sourceName:
        "Ministerio de Cultura y Turismo de Jujuy — Manual para Guías Idóneos",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Manual-para-Guias-Idoneos_v5.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
  },
  {
    id: "exp-feria-artesanos-purma",
    destinationId: "dest-purmamarca",
    name: "Feria de artesanos de Purmamarca",
    category: "market",
    interests: ["crafts", "culture", "food"],
    estimatedDurationMinutes: 45,
    budgetLevel: "medium",
    description:
      "Paseo por los puestos de artesanías y productos regionales de la plaza. La oferta, los horarios y los precios pueden variar según el día.",
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Manual-para-Guias-Idoneos_QUEBRADA_v5.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
  },
  {
    id: "exp-garganta-diablo",
    destinationId: "dest-garganta-diablo",
    name: "Caminata a la cascada de la Garganta del Diablo",
    category: "walk",
    interests: ["nature", "hiking", "photography"],
    estimatedDurationMinutes: 120,
    budgetLevel: "medium",
    description:
      "Sendero desde la toma de agua hacia una cascada natural. El manual provincial describe un tramo final a pie por el lecho del río; consultar a la comunidad local y evitar el recorrido ante lluvias o crecidas.",
    source: {
      sourceName:
        "Ministerio de Cultura y Turismo de Jujuy — Manual para Guías Idóneos",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Manual-para-Guias-Idoneos_QUEBRADA_v5.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
  },
  {
    id: "exp-hornocal-mirador",
    destinationId: "dest-hornocal",
    name: "Mirador de la Serranía del Hornocal",
    category: "viewpoint",
    interests: ["landscape", "nature", "photography"],
    estimatedDurationMinutes: 60,
    budgetLevel: "medium",
    description:
      "Visita al mirador comunitario de la Serranía del Hornocal. Desde Humahuaca son unos 25 km por la RP 73 y el trayecto de ida demanda alrededor de una hora. Camino de montaña de tierra y sinuoso; con lluvias puede volverse resbaladizo. Verificar estado del camino antes de salir.",
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Catalogo-TRC-Rutas-73-y-83.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "exp-iglesia-uquia",
    destinationId: "dest-uquia",
    name: "Iglesia de San Francisco de Paula",
    category: "historic_center",
    interests: ["history", "culture", "photography"],
    estimatedDurationMinutes: 30,
    budgetLevel: "low",
    description:
      "Visita patrimonial a la iglesia histórica de Uquía. Confirmar apertura y condiciones de visita en destino.",
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Libro-Turismo.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
  },
  {
    id: "exp-monumento-independencia",
    destinationId: "dest-humahuaca",
    name: "Monumento a los Héroes de la Independencia",
    category: "viewpoint",
    interests: ["history", "culture", "photography"],
    estimatedDurationMinutes: 30,
    budgetLevel: "low",
    description:
      "Visita al conjunto escultórico y mirador urbano de Humahuaca, uno de los hitos patrimoniales de la localidad. Duración orientativa.",
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Libro-Turismo.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
  },
  {
    id: "exp-paleta-del-pintor",
    destinationId: "dest-maimara",
    name: "Mirador de la Paleta del Pintor",
    category: "viewpoint",
    interests: ["landscape", "nature", "photography"],
    estimatedDurationMinutes: 30,
    budgetLevel: "low",
    description:
      "Parada panorámica para observar los cerros policromados y el pueblo de Maimará. El mirador se encuentra sobre la ruta; confirmar condiciones de acceso en el lugar.",
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl: "https://www.turismo.jujuy.gob.ar/maimara/",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
  },
  {
    id: "exp-paseo-colorados",
    destinationId: "dest-purmamarca",
    name: "Paseo de los Colorados",
    category: "walk",
    interests: ["hiking", "landscape", "nature", "photography"],
    estimatedDurationMinutes: 90,
    budgetLevel: "low",
    description:
      "Circuito peatonal de aproximadamente 3 km que rodea Purmamarca y atraviesa formaciones rocosas de distintos colores. Tiempo de caminata estimado; puede variar según ritmo y paradas.",
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Manual-para-Guias-Idoneos_QUEBRADA_v5.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "exp-posta-hornillos",
    destinationId: "dest-posta-hornillos",
    name: "Museo y Posta de Hornillos",
    category: "museum",
    interests: ["history", "culture", "archaeology"],
    estimatedDurationMinutes: 60,
    budgetLevel: "medium",
    description:
      "Visita a la posta construida en 1772, antiguo paso del camino entre Potosí y Buenos Aires y sitio vinculado a Manuel Belgrano. Confirmar días, horarios y tarifa antes de ir.",
    source: {
      sourceName: "Comisión de Filmaciones de Jujuy",
      sourceUrl:
        "https://comisiondefilmaciones.jujuy.gob.ar/locaciones/posta-de-hornillos/",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "exp-pucara-de-tilcara",
    destinationId: "dest-tilcara",
    name: "Pucará de Tilcara",
    category: "archaeological_site",
    interests: ["archaeology", "history", "culture", "landscape"],
    estimatedDurationMinutes: 120,
    budgetLevel: "medium",
    description:
      "Sitio arqueológico de gran valor histórico y ritual. La visita libre se realiza por senderos señalizados; las visitas guiadas requieren reserva semanal. Horarios publicados por el Centro Universitario Tilcara: martes a domingo de 09:00 a 18:30, último ingreso 17:15; lunes cerrado.",
    source: {
      sourceName: "Centro Universitario Tilcara - UBA",
      sourceUrl: "https://tilcara.filo.uba.ar/pucará-de-tilcara",
      verifiedAt: "2026-11-13",
    },
    confidence: "verified",
  },
  {
    id: "exp-salinas-grandes",
    destinationId: "dest-salinas-grandes",
    name: "Recorrido por Salinas Grandes",
    category: "walk",
    interests: ["landscape", "nature", "photography", "culture"],
    estimatedDurationMinutes: 90,
    budgetLevel: "medium",
    description:
      "Experiencia de paisaje en el salar de altura. Es una excursión fuera del corredor ferroviario de la Quebrada y requiere planificar el cruce de la Cuesta de Lipán; la altitud y el clima deben considerarse. Duración estimada solo para la visita en el salar, sin traslados.",
    source: {
      sourceName: "Ministerio de Cultura y Turismo de Jujuy",
      sourceUrl:
        "https://www.turismo.jujuy.gob.ar/wp-content/uploads/Catalogo-Internacional-Ingles.pdf",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
  },
  {
    id: "exp-tren-solar-360",
    destinationId: "dest-volcan",
    name: "Experiencia 360° del Tren Solar",
    category: "walk",
    interests: ["landscape", "culture", "photography"],
    estimatedDurationMinutes: 540,
    budgetLevel: "high",
    description:
      "Experiencia turística de jornada completa con guía, paradas programadas y propuestas opcionales en las localidades del corredor ferroviario. Consultar fecha, itinerario y tarifa vigentes en el sitio oficial.",
    source: {
      sourceName: "Tren Solar de la Quebrada",
      sourceUrl: "https://trensolar.com.ar/experiencia-360/",
      verifiedAt: "2026-11-13",
    },
    confidence: "estimated",
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
