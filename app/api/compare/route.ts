// Strategy comparison endpoint (QTR-014).
//
// Receives planner preferences, validates them on the server and answers with
// the candidate strategies from the pure domain engine (QTR-012). There is no
// database access yet: the comparison is a deterministic function of the
// request, so privileged details can never leak through this route.
//
// Relative imports keep the module runnable under Vitest, which does not
// resolve the "@/" alias configured for the app.

import { selectStrategies } from "../../../features/planner/domain/select-strategies";
import { validatePreferences } from "../../../features/planner/domain/validate-preferences";
import { ApiError, jsonError } from "../../../lib/http/errors";

const INVALID_JSON_MESSAGE = "El cuerpo de la solicitud debe ser JSON válido.";
const INVALID_PREFERENCES_MESSAGE = "Los datos de preferencias no son válidos.";

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "invalid_input", INVALID_JSON_MESSAGE);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await readJsonBody(request);
    const validation = validatePreferences(payload);

    if (!validation.ok) {
      throw new ApiError(400, "invalid_input", INVALID_PREFERENCES_MESSAGE);
    }

    return Response.json({ strategies: selectStrategies(validation.value) });
  } catch (error) {
    return jsonError(error);
  }
}
