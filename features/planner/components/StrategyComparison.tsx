"use client";

// Strategy comparison panel (QTR-016).
//
// Presentational only: the form owns the request and the state machine, while
// this component renders every outcome, so the traveller always knows what the
// planner is doing (loading, error, empty or ready). The cards are real radio
// options.
//
// QTR-023: the traveller selects one strategy here and asks for its itinerary
// without leaving the comparison. The panel still renders no request of its
// own; it forwards the selection and the intent to the form, which keeps the
// single source of truth for both state machines.

import { ItinerarySummary } from "../../itinerary/components/ItinerarySummary";
import { isStrategyId, type StrategyId } from "../domain/select-strategies";
import type {
  Itinerary,
  TravelPreferences,
  TravelStrategy,
} from "../domain/types";
import { StrategyCard } from "./StrategyCard";

export type ComparisonState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string; preferences: TravelPreferences }
  | { status: "ready"; strategies: TravelStrategy[] };

export type ItineraryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; itinerary: Itinerary };

interface StrategyComparisonProps {
  state: ComparisonState;
  /** Strategy the traveller picked, or `null` while none is selected. */
  selectedStrategyId: StrategyId | null;
  /** Selects one strategy and clears any itinerary built from another one. */
  onSelectStrategy: (strategyId: StrategyId) => void;
  /** Itinerary request state for the selected strategy. */
  itinerary: ItineraryState;
  /** Requests the itinerary for the selected strategy. */
  onGenerate: () => void;
  /** Returns to the form without discarding any answer. */
  onBack: () => void;
  /** Retries the request that failed. */
  onRetry: () => void;
}

interface ItinerarySectionProps {
  itinerary: ItineraryState;
  strategies: TravelStrategy[];
  onGenerate: () => void;
  onBack: () => void;
}

const BACK_LABEL = "Volver a las preferencias";
const MODIFY_ANSWERS_LABEL = "Modificar respuestas";
const ITINERARY_DISCLAIMER =
  "El itinerario es una propuesta estimada a partir del catálogo; no confirma horarios ni disponibilidad de transporte. Revise las advertencias y confirme cada servicio antes de reservar.";

function ItinerarySection({
  itinerary,
  strategies,
  onGenerate,
  onBack,
}: ItinerarySectionProps) {
  if (itinerary.status === "idle") {
    return null;
  }

  if (itinerary.status === "loading") {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-base-300 p-4">
        <span className="loading loading-spinner loading-sm" aria-hidden="true" />
        <p role="status" className="text-sm text-base-content/70">
          Generando su itinerario…
        </p>
      </section>
    );
  }

  if (itinerary.status === "error") {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-error/40 bg-error/5 p-4">
        <h2 className="text-lg font-semibold">No se pudo generar el itinerario</h2>
        <p role="alert" className="text-sm text-error">
          {itinerary.message}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onGenerate}
          >
            Reintentar
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
            {MODIFY_ANSWERS_LABEL}
          </button>
        </div>
      </section>
    );
  }

  const chosen =
    strategies.find((strategy) => strategy.id === itinerary.itinerary.strategyId) ??
    null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">Su itinerario</h2>
      {chosen ? (
        <p className="text-sm text-base-content/70">
          Estrategia elegida: {chosen.name}.
        </p>
      ) : null}
      <p className="text-sm text-base-content/70">{ITINERARY_DISCLAIMER}</p>
      <ItinerarySummary
        itinerary={itinerary.itinerary}
        strategyName={chosen?.name ?? null}
      />
      <button
        type="button"
        className="btn btn-ghost btn-sm self-start"
        onClick={onBack}
      >
        {MODIFY_ANSWERS_LABEL}
      </button>
    </section>
  );
}

export function StrategyComparison({
  state,
  selectedStrategyId,
  onSelectStrategy,
  itinerary,
  onGenerate,
  onBack,
  onRetry,
}: StrategyComparisonProps) {
  if (state.status === "idle") {
    return null;
  }

  if (state.status === "loading") {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-base-300 p-4">
        <span className="loading loading-spinner loading-sm" aria-hidden="true" />
        <p role="status" className="text-sm text-base-content/70">
          Comparando estrategias…
        </p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-error/40 bg-error/5 p-4">
        <h2 className="text-lg font-semibold">No se pudo comparar</h2>
        <p role="alert" className="text-sm text-error">
          {state.message}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onRetry}
          >
            Reintentar
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
            {BACK_LABEL}
          </button>
        </div>
      </section>
    );
  }

  if (state.strategies.length === 0) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-base-300 p-4">
        <h2 className="text-lg font-semibold">Sin resultados</h2>
        <p role="status" className="text-sm text-base-content/70">
          No hay estrategias disponibles para estas preferencias.
        </p>
        <button
          type="button"
          className="btn btn-ghost btn-sm self-start"
          onClick={onBack}
        >
          {BACK_LABEL}
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-4">
        <legend className="text-xl font-semibold tracking-tight">
          Estrategias comparadas
        </legend>
        <p className="text-sm text-base-content/70">
          Ordenadas por afinidad con sus preferencias. Los datos marcados como
          «por confirmar» no están verificados: confirme horarios y
          disponibilidad antes de reservar.
        </p>
        <p className="text-sm text-base-content/70">
          Elija una estrategia para generar su itinerario.
        </p>
        <div className="grid gap-4 xl:grid-cols-2">
          {state.strategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              name="strategy"
              checked={selectedStrategyId === strategy.id}
              onSelect={() => {
                if (isStrategyId(strategy.id)) {
                  onSelectStrategy(strategy.id);
                }
              }}
            />
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={selectedStrategyId === null || itinerary.status === "loading"}
          onClick={onGenerate}
        >
          Generar itinerario
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
          {BACK_LABEL}
        </button>
      </div>
      <ItinerarySection
        itinerary={itinerary}
        strategies={state.strategies}
        onGenerate={onGenerate}
        onBack={onBack}
      />
    </section>
  );
}
