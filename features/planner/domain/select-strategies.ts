// Strategy selection.
//
// Pure and framework-free: receives validated travel preferences and returns the
// candidate strategies, most relevant first (QTR-012). No React, no database, no
// network, so the comparison view can reuse it without rendering anything.
//
// The order is a comparison hint, not a recommendation score. Budget and
// interests shape the itinerary later (QTR-017); mobility, origin, trip length,
// pace and the lodging decision decide which strategies are plausible now.
// Unknown logistics never remove a strategy: they surface as warnings (FR-10).

import type { TransportMode } from "../../catalog/domain/types";
import type { Mobility, TravelPreferences, TravelStrategy } from "./types";

export const STRATEGY_IDS = [
  "excursiones-desde-salta",
  "base-en-la-quebrada",
  "recorrido-con-movilidad-propia-o-combinada",
  "tren-solar",
] as const;

export type StrategyId = (typeof STRATEGY_IDS)[number];

function formatDays(days: number): string {
  return days === 1 ? "1 día" : `${days} días`;
}

/**
 * Conditions the catalogue cannot resolve yet. They are shared by every
 * strategy because all of them depend on how the traveller reaches the
 * Quebrada and how the chosen transport combines.
 */
function commonWarnings(preferences: TravelPreferences): string[] {
  const warnings: string[] = [];

  if (preferences.origin.kind === "other") {
    warnings.push(
      "El origen no figura en el catálogo: los tiempos y costos de traslado deben estimarse y confirmarse.",
    );
  }

  if (preferences.mobility === "mixed") {
    warnings.push(
      "La combinación de transporte no define tramos concretos: hay que elegir las conexiones y confirmar sus horarios.",
    );
  }

  return warnings;
}

function baseLogistics(mobility: Mobility): TransportMode[] {
  switch (mobility) {
    case "own_car":
      return ["car", "walk"];
    case "guided_excursions":
      return ["guided_excursion", "walk"];
    case "solar_train":
      return ["solar_train", "mixed", "walk"];
    case "mixed":
      return ["mixed", "walk"];
    case "without_car":
      return ["bus", "walk"];
  }
}

function loopLogistics(mobility: Mobility): TransportMode[] {
  switch (mobility) {
    case "own_car":
      return ["car"];
    case "guided_excursions":
      return ["guided_excursion", "mixed"];
    case "solar_train":
      return ["solar_train", "mixed"];
    case "mixed":
      return ["mixed"];
    case "without_car":
      return ["bus", "mixed"];
  }
}

function buildExcursionStrategy(
  preferences: TravelPreferences,
): TravelStrategy {
  const { days, mobility, origin } = preferences;

  return {
    id: "excursiones-desde-salta",
    name: "Excursiones desde Salta",
    summary:
      "Salir de Salta en excursiones de un día hacia la Quebrada, con traslado y guía a cargo del operador.",
    fits: [
      "Viajes cortos, de uno a tres días",
      "Quien prefiere no cambiar de alojamiento",
      "Quien no quiere conducir ni coordinar micros",
    ],
    advantages: [
      "Resuelve traslado y guía en una sola contratación",
      "No exige reservar alojamiento en la Quebrada",
      "Permite conocer la Quebrada sin auto propio",
    ],
    limitations: [
      "Se pasa más tiempo en ruta y menos en cada pueblo",
      "Los horarios y puntos de encuentro dependen del operador",
      "Hay menos margen para adaptar el recorrido",
    ],
    logistics: ["guided_excursion", "bus"],
    confidence: "needs_verification",
    warnings: [
      "Los horarios, puntos de encuentro y precios de las excursiones dependen del operador y deben confirmarse.",
      ...(origin.kind === "salta"
        ? []
        : [
            "La excursión de un día suele salir desde Salta; hay que sumar el traslado hasta la ciudad.",
          ]),
      ...(days >= 4
        ? [
            `Con ${formatDays(days)}, una salida de un día deja poco margen para el resto de la Quebrada.`,
          ]
        : []),
      ...(mobility === "own_car"
        ? [
            "Con auto propio, una excursión organizada puede ser innecesaria; conviene comparar con el recorrido por cuenta propia.",
          ]
        : []),
      ...commonWarnings(preferences),
    ],
  };
}

function buildBaseStrategy(preferences: TravelPreferences): TravelStrategy {
  const { days, lodging, mobility } = preferences;
  const baseWithoutPlace = lodging.decided && lodging.destinationId === null;

  return {
    id: "base-en-la-quebrada",
    name: "Base en la Quebrada",
    summary:
      "Alojarse en un pueblo de la Quebrada y recorrer los alrededores desde una sola base.",
    fits: [
      "Estadías de tres días o más",
      "Quien quiere ver la Quebrada con calma",
      "Quien acepta traslados locales cortos",
    ],
    advantages: [
      "Menos tiempo en ruta durante la estadía",
      "Más margen para el clima y el ritmo del viaje",
      "Permite recorrer a pie el pueblo donde se aloja",
    ],
    limitations: [
      "Requiere reservar alojamiento en la Quebrada",
      "Los traslados locales pueden depender de micros o combis con horarios limitados",
    ],
    logistics: baseLogistics(mobility),
    confidence: "needs_verification",
    warnings: [
      "La disponibilidad y los precios del alojamiento en la Quebrada deben confirmarse para las fechas del viaje.",
      ...(baseWithoutPlace
        ? [
            "Indicó una base elegida pero no especificó la localidad: hay que confirmarla.",
          ]
        : []),
      ...(mobility === "without_car"
        ? [
            "Sin auto, la frecuencia de micros y combis desde la base debe confirmarse.",
          ]
        : []),
      ...(days <= 2
        ? [
            "Con dos días o menos, una base fija suma traslados de ida y vuelta; conviene comparar con la excursión desde Salta.",
          ]
        : []),
      ...commonWarnings(preferences),
    ],
  };
}

function buildLoopStrategy(preferences: TravelPreferences): TravelStrategy {
  const { days, mobility, origin } = preferences;

  return {
    id: "recorrido-con-movilidad-propia-o-combinada",
    name: "Recorrido con movilidad propia o combinada",
    summary:
      "Moverse entre pueblos de la Quebrada con auto propio, alquiler o una combinación de transporte local.",
    fits: [
      "Viajes de cuatro días o más",
      "Quien quiere conocer varios pueblos sin volver cada noche al mismo lugar",
      "Quien se anima a conducir o a combinar micros y combis",
    ],
    advantages: [
      "Más libertad para parar en miradores y pueblos",
      "Mejor aprovechamiento del día",
      "Permite ajustar el plan según el clima y la energía",
    ],
    limitations: [
      "Conducir en rutas de altura y caminos de ripio exige precaución",
      "Combina traslados y horarios de distintos operadores",
    ],
    logistics: loopLogistics(mobility),
    confidence: "needs_verification",
    warnings: [
      "No se afirma el estado de rutas, caminos ni estacionamientos: deben confirmarse antes de salir.",
      ...(mobility === "without_car"
        ? [
            "Sin auto, esta estrategia depende de micros, combis o alquiler; horarios y disponibilidad deben confirmarse.",
          ]
        : []),
      ...(days <= 3
        ? [
            `Con ${formatDays(days)}, cambiar de base suma traslados y deja menos tiempo en cada lugar.`,
          ]
        : []),
      ...(origin.kind === "salta"
        ? [
            "El primer y el último día incluyen el traslado desde y hacia Salta, así que no quedan completos para visitar.",
          ]
        : []),
      ...commonWarnings(preferences),
    ],
  };
}

function buildSolarTrainStrategy(
  preferences: TravelPreferences,
): TravelStrategy {
  const { mobility } = preferences;
  const chosen = mobility === "solar_train" || mobility === "mixed";

  return {
    id: "tren-solar",
    name: "Tren Solar",
    summary:
      "Sumar el Tren Solar al recorrido y completar con traslados locales los tramos que no cubre.",
    fits: [
      "Quien quiere sumar el Tren Solar como parte del paseo",
      "Quien acepta combinar el tren con traslados locales",
    ],
    advantages: [
      "Recorrido panorámico entre estaciones de la Quebrada",
      "Combina con visitas en las localidades de cada parada",
    ],
    limitations: [
      "Solo cubre las estaciones del servicio, no todos los atractivos",
      "Requiere coordinar los tramos que el tren no cubre",
    ],
    logistics: ["solar_train", "mixed"],
    confidence: "needs_verification",
    warnings: [
      "Los horarios, frecuencias y estaciones habilitadas del Tren Solar deben confirmarse; esta versión no los afirma.",
      "El Tren Solar no cubre todos los destinos ni los traslados finales: esos tramos hay que resolverlos por separado.",
      ...(chosen
        ? []
        : [
            "El Tren Solar no coincide con la movilidad elegida; aparece solo como alternativa para comparar.",
          ]),
      ...commonWarnings(preferences),
    ],
  };
}

const STRATEGY_BUILDERS: Record<
  StrategyId,
  (preferences: TravelPreferences) => TravelStrategy
> = {
  "excursiones-desde-salta": buildExcursionStrategy,
  "base-en-la-quebrada": buildBaseStrategy,
  "recorrido-con-movilidad-propia-o-combinada": buildLoopStrategy,
  "tren-solar": buildSolarTrainStrategy,
};

// Scores only order the list. Each weight encodes a plain-language rule:
// - excursion: short trips, Salta departures, travellers without a car;
// - base: three or more days, a decided base, a non-intensive pace;
// - loop: own car or mixed mobility, four or more days, an intensive pace;
// - solar train: only when the traveller chose it, otherwise a comparison option.
function scoreExcursion(preferences: TravelPreferences): number {
  let score = 0;

  if (preferences.origin.kind === "salta") score += 4;
  if (preferences.mobility === "guided_excursions") score += 5;
  if (preferences.mobility === "without_car") score += 4;
  if (preferences.mobility === "mixed") score += 1;
  if (preferences.days <= 3) score += 3;
  if (preferences.days >= 5) score -= 3;
  if (!preferences.lodging.decided) score += 1;

  return score;
}

function scoreBase(preferences: TravelPreferences): number {
  let score = 0;

  if (preferences.days >= 3) score += 5;
  else score -= 2;
  if (preferences.lodging.decided) score += 4;
  if (preferences.origin.kind !== "salta") score += 2;
  if (preferences.pace !== "intensive") score += 2;
  if (preferences.mobility === "without_car") score += 1;

  return score;
}

function scoreLoop(preferences: TravelPreferences): number {
  let score = 0;

  if (preferences.mobility === "own_car") score += 6;
  if (preferences.mobility === "mixed") score += 3;
  if (preferences.mobility === "without_car") score -= 4;
  if (preferences.days >= 4) score += 4;
  if (preferences.days <= 3) score -= 2;
  if (preferences.pace === "intensive") score += 2;
  if (preferences.pace === "relaxed") score -= 1;

  return score;
}

function scoreSolarTrain(preferences: TravelPreferences): number {
  let score = 0;

  if (preferences.mobility === "solar_train") score += 10;
  else if (preferences.mobility === "mixed") score += 2;
  else score -= 6;
  if (preferences.days >= 2) score += 1;

  return score;
}

const STRATEGY_SCORES: Record<StrategyId, (preferences: TravelPreferences) => number> =
  {
    "excursiones-desde-salta": scoreExcursion,
    "base-en-la-quebrada": scoreBase,
    "recorrido-con-movilidad-propia-o-combinada": scoreLoop,
    "tren-solar": scoreSolarTrain,
  };

/**
 * Returns every candidate strategy, most relevant first. Preferences must be
 * already validated: unknown shapes are rejected before this point (QTR-011).
 * Ties keep the declaration order so the result is deterministic.
 */
export function selectStrategies(
  preferences: TravelPreferences,
): TravelStrategy[] {
  const ranked = STRATEGY_IDS.map((id, index) => ({
    strategy: STRATEGY_BUILDERS[id](preferences),
    score: STRATEGY_SCORES[id](preferences),
    index,
  }));

  ranked.sort(
    (left, right) => right.score - left.score || left.index - right.index,
  );

  return ranked.map((entry) => entry.strategy);
}
