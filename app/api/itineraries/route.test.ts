// Itinerary generation endpoint tests (QTR-021).
//
// The route is a thin server boundary over the generation service, so these
// tests cover the contract the browser depends on: a valid request returns a
// complete itinerary, every rejected input keeps the shared error envelope
// with its exact message, and repository failures never leak internals.

import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  Destination,
  Experience,
  TransportOption,
} from "../../../features/catalog/domain/types";
import { EMPTY_CATALOG_WARNING } from "../../../features/itinerary/domain/generate-itinerary";
import type {
  Itinerary,
  TravelPreferences,
} from "../../../features/planner/domain/types";

import { POST } from "./route";

/**
 * Mutable fixtures shared with the mocked repository. `vi.hoisted` runs before
 * the module factory, so the mock serves the current state on every call while
 * each test decides what the catalogue looks like.
 */
const state = vi.hoisted(
  (): {
    defaultDestinations: Destination[];
    defaultExperiences: Experience[];
    defaultTransportOptions: TransportOption[];
    destinations: Destination[];
    experiences: Experience[];
    transportOptions: TransportOption[];
    repositoryError: Error | null;
  } => {
    const defaultDestinations: Destination[] = [
      {
        id: "dest-tilcara",
        slug: "dest-tilcara",
        name: "Tilcara",
        description: "Localidad ficticia para las pruebas.",
        zone: "Quebrada de Humahuaca",
        category: "locality",
        estimatedVisitMinutes: null,
        latitude: null,
        longitude: null,
        active: true,
        source: null,
        confidence: "needs_verification",
      },
    ];
    const defaultExperiences: Experience[] = [
      {
        id: "exp-caminata",
        destinationId: "dest-tilcara",
        name: "Caminata por el pueblo",
        category: "viewpoint",
        interests: ["landscape"],
        estimatedDurationMinutes: 120,
        budgetLevel: null,
        description: "Experiencia ficticia para las pruebas.",
        source: null,
        confidence: "needs_verification",
      },
    ];
    const defaultTransportOptions: TransportOption[] = [];

    return {
      defaultDestinations,
      defaultExperiences,
      defaultTransportOptions,
      destinations: [...defaultDestinations],
      experiences: [...defaultExperiences],
      transportOptions: [...defaultTransportOptions],
      repositoryError: null,
    };
  },
);

vi.mock("../../../features/catalog/services/catalog-repository", () => ({
  listDestinations: vi.fn(async (): Promise<Destination[]> => {
    if (state.repositoryError !== null) {
      throw state.repositoryError;
    }

    return state.destinations;
  }),
  listExperiences: vi.fn(async (): Promise<Experience[]> => {
    if (state.repositoryError !== null) {
      throw state.repositoryError;
    }

    return state.experiences;
  }),
  listTransportOptions: vi.fn(async (): Promise<TransportOption[]> => {
    if (state.repositoryError !== null) {
      throw state.repositoryError;
    }

    return state.transportOptions;
  }),
}));

const validPreferences: TravelPreferences = {
  days: 3,
  origin: { kind: "salta" },
  mobility: "without_car",
  lodging: { decided: false },
  budget: "medium",
  interests: ["landscape", "history"],
  pace: "balanced",
};

function itineraryRequest(body: string): Request {
  return new Request("http://localhost/api/itineraries", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

afterEach(() => {
  state.destinations = [...state.defaultDestinations];
  state.experiences = [...state.defaultExperiences];
  state.transportOptions = [...state.defaultTransportOptions];
  state.repositoryError = null;
});

describe("POST /api/itineraries", () => {
  it("returns a complete itinerary for a valid request", async () => {
    const response = await POST(
      itineraryRequest(
        JSON.stringify({
          strategyId: "tren-solar",
          preferences: validPreferences,
        }),
      ),
    );

    expect(response.status).toBe(200);

    const body = (await response.json()) as { itinerary: Itinerary };
    expect(body.itinerary.strategyId).toBe("tren-solar");
    expect(body.itinerary.days).toHaveLength(3);
    expect(body.itinerary.days[0].blocks).toHaveLength(1);
    expect(body.itinerary.days[0].blocks[0].title).toBe(
      "Caminata por el pueblo",
    );
  });

  it("rejects preferences that fail server-side validation", async () => {
    const response = await POST(
      itineraryRequest(
        JSON.stringify({
          strategyId: "tren-solar",
          preferences: { ...validPreferences, days: 0 },
        }),
      ),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: { code: "invalid_input", message: expect.any(String) },
    });
  });

  it("rejects an unknown strategy id", async () => {
    const response = await POST(
      itineraryRequest(
        JSON.stringify({
          strategyId: "estrategia-inexistente",
          preferences: validPreferences,
        }),
      ),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "invalid_input",
        message: "La estrategia elegida no es válida.",
      },
    });
  });

  it("rejects a body that is not valid JSON", async () => {
    const response = await POST(itineraryRequest("{"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "invalid_input",
        message: "El cuerpo de la solicitud debe ser JSON válido.",
      },
    });
  });

  it("rejects a body without the expected shape", async () => {
    const response = await POST(
      itineraryRequest(JSON.stringify({ preferences: validPreferences })),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "invalid_input",
        message: "La solicitud no tiene el formato esperado.",
      },
    });
  });

  it("degrades to empty days with a warning when the catalogue is empty", async () => {
    state.experiences = [];

    const response = await POST(
      itineraryRequest(
        JSON.stringify({
          strategyId: "tren-solar",
          preferences: validPreferences,
        }),
      ),
    );

    expect(response.status).toBe(200);

    const body = (await response.json()) as { itinerary: Itinerary };
    expect(body.itinerary.days).toHaveLength(3);
    expect(body.itinerary.days.map((day) => day.blocks)).toEqual([[], [], []]);
    expect(body.itinerary.warnings).toContain(EMPTY_CATALOG_WARNING);
  });

  it("hides repository failure details behind the shared envelope", async () => {
    state.repositoryError = new Error(
      "connect ECONNREFUSED 127.0.0.1:5432 password=supersecret",
    );

    const response = await POST(
      itineraryRequest(
        JSON.stringify({
          strategyId: "tren-solar",
          preferences: validPreferences,
        }),
      ),
    );

    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error.code).toBe("internal_error");

    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("ECONNREFUSED");
    expect(serialized).not.toContain("supersecret");
  });
});
