// Itinerary generation endpoint (QTR-021).
//
// Receives a strategy id plus planner preferences, validates both on the
// server and answers with a full itinerary built from the catalogue. Failures
// keep the shared error envelope: rejected input is a 400 and anything the
// repository throws collapses into a sanitized 500.
//
// Relative imports keep the module runnable under Vitest, which does not
// resolve the "@/" alias configured for the app.

import { generateItineraryFromCatalog } from "../../../features/itinerary/services/generate-itinerary";
import {
  STRATEGY_IDS,
  type StrategyId,
} from "../../../features/planner/domain/select-strategies";
import { validatePreferences } from "../../../features/planner/domain/validate-preferences";
import { ApiError, jsonError } from "../../../lib/http/errors";

const INVALID_JSON_MESSAGE = "El cuerpo de la solicitud debe ser JSON válido.";
const INVALID_REQUEST_MESSAGE = "La solicitud no tiene el formato esperado.";
const INVALID_STRATEGY_MESSAGE = "La estrategia elegida no es válida.";
const INVALID_PREFERENCES_MESSAGE = "Los datos de preferencias no son válidos.";

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "invalid_input", INVALID_JSON_MESSAGE);
  }
}

interface ItineraryRequest {
  strategyId: unknown;
  preferences: unknown;
}

function isItineraryRequest(value: unknown): value is ItineraryRequest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return "strategyId" in value && "preferences" in value;
}

function isStrategyId(value: unknown): value is StrategyId {
  if (typeof value !== "string") {
    return false;
  }

  return STRATEGY_IDS.some((id) => id === value);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await readJsonBody(request);

    if (!isItineraryRequest(payload)) {
      throw new ApiError(400, "invalid_input", INVALID_REQUEST_MESSAGE);
    }

    if (!isStrategyId(payload.strategyId)) {
      throw new ApiError(400, "invalid_input", INVALID_STRATEGY_MESSAGE);
    }

    const validation = validatePreferences(payload.preferences);

    if (!validation.ok) {
      throw new ApiError(400, "invalid_input", INVALID_PREFERENCES_MESSAGE);
    }

    const itinerary = await generateItineraryFromCatalog(
      payload.strategyId,
      validation.value,
    );

    return Response.json({ itinerary });
  } catch (error) {
    return jsonError(error);
  }
}
