"use client";

// Strategy comparison panel (QTR-016).
//
// Presentational only: the form owns the request and the state machine, while
// this component renders every outcome, so the traveller always knows what the
// planner is doing (loading, error, empty or ready). The cards are real radio
// options, so the itinerary step can later select one of them.

import type { TravelPreferences, TravelStrategy } from "../domain/types";
import { StrategyCard } from "./StrategyCard";

export type ComparisonState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string; preferences: TravelPreferences }
  | { status: "ready"; strategies: TravelStrategy[] };

interface StrategyComparisonProps {
  state: ComparisonState;
  /** Returns to the form without discarding any answer. */
  onBack: () => void;
  /** Retries the request that failed. */
  onRetry: () => void;
}

const BACK_LABEL = "Volver a las preferencias";

export function StrategyComparison({
  state,
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
        <div className="grid gap-4 xl:grid-cols-2">
          {state.strategies.map((strategy, index) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              name="strategy"
              defaultChecked={index === 0}
            />
          ))}
        </div>
      </fieldset>
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
