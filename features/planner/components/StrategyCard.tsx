"use client";

// Strategy comparison card (QTR-013).
//
// The card is a real radio option so the itinerary step can select one
// strategy (PROJECT_SPEC.md line 98). The input stays visually hidden but
// focusable, and the card reflects focus and selection through `has-*`
// variants, which keeps the focus ring visible without duplicating state.
//
// The whole card is one <label> target, but the label is an overlay instead of
// a wrapper: a label may only contain phrasing content, so wrapping the
// sections would produce invalid HTML.

import { useId } from "react";

import type { ConfidenceStatus } from "../../catalog/domain/confidence";
import type { TransportMode } from "../../catalog/domain/types";
import type { TravelStrategy } from "../domain/types";

const TRANSPORT_LABELS: Record<TransportMode, string> = {
  bus: "Colectivo",
  solar_train: "Tren Solar",
  guided_excursion: "Excursión guiada",
  car: "Auto",
  walk: "Caminata",
  mixed: "Combinado",
};

interface ConfidenceBadge {
  label: string;
  className: string;
}

function confidenceBadge(confidence: ConfidenceStatus): ConfidenceBadge {
  switch (confidence) {
    case "verified":
      return { label: "Dato verificado", className: "badge-success" };
    case "estimated":
      return { label: "Dato estimado", className: "badge-info" };
    case "needs_verification":
      return { label: "Datos por confirmar", className: "badge-warning" };
  }
}

interface StrategyCardProps {
  strategy: TravelStrategy;
  /** Radio group name. Every card in one comparison shares it. */
  name: string;
  defaultChecked?: boolean;
}

export function StrategyCard({
  strategy,
  name,
  defaultChecked = false,
}: StrategyCardProps) {
  const inputId = useId();
  const titleId = useId();
  const summaryId = useId();
  const badge = confidenceBadge(strategy.confidence);

  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 transition-colors hover:border-primary/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-base-100 sm:p-5">
      <input
        id={inputId}
        type="radio"
        name={name}
        value={strategy.id}
        defaultChecked={defaultChecked}
        aria-labelledby={titleId}
        aria-describedby={summaryId}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className="absolute inset-0 cursor-pointer rounded-2xl"
        aria-hidden="true"
      />

      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={titleId} className="text-lg font-semibold tracking-tight">
          {strategy.name}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Selection is announced by the radio itself, but the visible badge
              keeps it from depending on border color alone. */}
          <span className="badge badge-primary badge-sm hidden group-has-[:checked]:inline-flex">
            Elegida
          </span>
          <span className={`badge badge-sm ${badge.className}`}>{badge.label}</span>
        </div>
      </div>

      <p id={summaryId} className="text-sm text-base-content/70">
        {strategy.summary}
      </p>

      <section className="flex flex-col gap-1.5">
        <h4 className="text-sm font-semibold">Para quién encaja</h4>
        <ul className="list-disc space-y-1 pl-5 text-sm text-base-content/80">
          {strategy.fits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="flex flex-col gap-1.5">
          <h4 className="text-sm font-semibold text-success">Ventajas</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-base-content/80">
            {strategy.advantages.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-1.5">
          <h4 className="text-sm font-semibold text-error">Limitaciones</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-base-content/80">
            {strategy.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="flex flex-col gap-1.5 rounded-xl bg-base-200 p-3">
        <h4 className="text-sm font-semibold">Datos por confirmar</h4>
        {strategy.warnings.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-base-content/80">
            {strategy.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-base-content/70">
            Sin advertencias adicionales para este perfil.
          </p>
        )}
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <h4 className="text-xs font-semibold tracking-wide text-base-content/60 uppercase">
          Transporte previsto
        </h4>
        <ul className="flex flex-wrap gap-1.5">
          {strategy.logistics.map((mode) => (
            <li key={mode} className="badge badge-ghost badge-sm">
              {TRANSPORT_LABELS[mode]}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
