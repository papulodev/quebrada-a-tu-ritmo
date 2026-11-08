"use client";

// Travel preference form (QTR-015).
//
// The form mirrors the domain contract in ../domain/types.ts and reuses
// `validatePreferences` so the client and the comparison endpoint share one
// source of truth (FR-07). Every answer stays in local state, so a failed
// validation never discards what the traveller already entered.
//
// The client component does not submit to a Server Action: the comparison
// request is the next ticket, so today a valid submit only shows the
// normalised result.

import { useId, useRef, useState, type FormEvent } from "react";

import { DESTINATIONS } from "../../catalog/domain/destinations";
import type { BudgetLevel, Interest } from "../../catalog/domain/types";
import { BUDGET_LEVELS, INTERESTS } from "../../catalog/domain/types";
import type {
  LodgingBase,
  Mobility,
  Origin,
  OriginKind,
  Pace,
  TravelPreferences,
} from "../domain/types";
import { MOBILITIES, ORIGIN_KINDS, PACES } from "../domain/types";
import {
  TRIP_DAY_LIMITS,
  validatePreferences,
  type PreferenceIssue,
} from "../domain/validate-preferences";

const ORIGIN_LABELS: Record<OriginKind, string> = {
  salta: "Salta",
  san_salvador_de_jujuy: "San Salvador de Jujuy",
  quebrada_locality: "Localidad de la Quebrada",
  other: "Otro origen",
};

const MOBILITY_LABELS: Record<Mobility, string> = {
  without_car: "Sin auto",
  own_car: "Con auto propio",
  guided_excursions: "Excursiones guiadas",
  solar_train: "Tren Solar",
  mixed: "Combinada",
};

const BUDGET_LABELS: Record<BudgetLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
};

const PACE_LABELS: Record<Pace, string> = {
  relaxed: "Relajado",
  balanced: "Equilibrado",
  intensive: "Intensivo",
};

const INTEREST_LABELS: Record<Interest, string> = {
  archaeology: "Arqueología",
  history: "Historia",
  landscape: "Paisaje",
  nature: "Naturaleza",
  food: "Gastronomía",
  hiking: "Caminatas y senderismo",
  culture: "Cultura",
  photography: "Fotografía",
  crafts: "Artesanías",
  wellness: "Bienestar",
  astronomy: "Astronomía",
};

// Issues are grouped per visible field. `origin.kind` and `lodging.decided`
// belong to the same control group as their parent field, and indexed interest
// issues collapse into the single interests group.
const FIELD_ALIASES: Record<string, string> = {
  "origin.kind": "origin",
  "lodging.decided": "lodging",
};

// DOM order of the controls that can hold an issue. Used to move focus to the
// first invalid field after a failed submit.
const FOCUS_ORDER = [
  "days",
  "origin",
  "origin.destinationId",
  "mobility",
  "lodging",
  "lodging.destinationId",
  "budget",
  "interests",
  "pace",
];

const CATALOGUE_DESTINATIONS = DESTINATIONS.map((destination) => ({
  id: destination.id,
  name: destination.name,
}));

function destinationName(destinationId: string): string {
  const match = CATALOGUE_DESTINATIONS.find(
    (destination) => destination.id === destinationId,
  );
  return match ? match.name : "Localidad fuera del catálogo";
}

function groupIssues(issues: PreferenceIssue[]): Record<string, string> {
  const grouped: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.field.startsWith("interests.")
      ? "interests"
      : (FIELD_ALIASES[issue.field] ?? issue.field);
    if (!grouped[field]) {
      grouped[field] = issue.message;
    }
  }
  return grouped;
}

function parseDays(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  return Number(value);
}

function originSummary(origin: Origin): string {
  switch (origin.kind) {
    case "quebrada_locality":
      return `${ORIGIN_LABELS.quebrada_locality}: ${destinationName(origin.destinationId)}`;
    case "salta":
    case "san_salvador_de_jujuy":
    case "other":
      return ORIGIN_LABELS[origin.kind];
  }
}

function lodgingSummary(lodging: LodgingBase): string {
  if (!lodging.decided) {
    return "Sin base decidida";
  }
  if (lodging.destinationId === null) {
    return "Base decidida, localidad sin indicar";
  }
  return `Base en ${destinationName(lodging.destinationId)}`;
}

interface FieldErrorProps {
  id: string;
  message?: string;
}

function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} className="text-sm text-error">
      {message}
    </p>
  );
}

interface ChoiceFieldProps<T extends string> {
  legend: string;
  /** Validator field name; also the radio group name. */
  name: string;
  hint?: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
  error?: string;
}

function ChoiceField<T extends string>({
  legend,
  name,
  hint,
  options,
  labels,
  value,
  onChange,
  error,
}: ChoiceFieldProps<T>) {
  const baseId = useId();
  const hintId = `${baseId}-hint`;
  const errorId = `${baseId}-error`;
  const describedBy = error
    ? hint
      ? `${hintId} ${errorId}`
      : errorId
    : hint
      ? hintId
      : undefined;

  return (
    <fieldset
      className="flex flex-col gap-2"
      role="radiogroup"
      aria-invalid={Boolean(error)}
    >
      <legend className="text-sm font-semibold">{legend}</legend>
      {hint ? (
        <p id={hintId} className="text-sm text-base-content/70">
          {hint}
        </p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option, index) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-base-300 px-3 py-2 text-sm transition-colors hover:border-primary/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40"
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              data-field={index === 0 ? name : undefined}
              aria-describedby={describedBy}
              className="radio radio-primary radio-sm"
            />
            {labels[option]}
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-semibold tracking-wide text-base-content/60 uppercase">
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

export function PlannerForm() {
  const formId = useId();
  const fieldId = (name: string) => `${formId}-${name}`;
  const formRef = useRef<HTMLFormElement>(null);

  const [days, setDays] = useState("3");
  const [originKind, setOriginKind] = useState<OriginKind>("salta");
  const [originDestinationId, setOriginDestinationId] = useState("");
  const [mobility, setMobility] = useState<Mobility>("without_car");
  const [lodgingDecided, setLodgingDecided] = useState(false);
  const [lodgingDestinationId, setLodgingDestinationId] = useState("");
  const [budget, setBudget] = useState<BudgetLevel>("medium");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [pace, setPace] = useState<Pace>("balanced");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validated, setValidated] = useState<TravelPreferences | null>(null);

  const daysError = errors.days;
  const originError = errors.origin;
  const originDestinationError = errors["origin.destinationId"];
  const lodgingError = errors.lodging;
  const lodgingDestinationError = errors["lodging.destinationId"];
  const interestsError = errors.interests;

  function toggleInterest(interest: Interest, checked: boolean) {
    setInterests((current) =>
      checked
        ? [...current, interest]
        : current.filter((item) => item !== interest),
    );
  }

  function focusFirstIssue(fieldErrors: Record<string, string>) {
    const form = formRef.current;
    if (!form) {
      return;
    }
    for (const field of FOCUS_ORDER) {
      if (!fieldErrors[field]) {
        continue;
      }
      const control = form.querySelector<HTMLElement>(
        `[data-field="${field}"]`,
      );
      if (control) {
        control.focus();
        return;
      }
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const origin =
      originKind === "quebrada_locality"
        ? { kind: originKind, destinationId: originDestinationId }
        : { kind: originKind };

    const lodging: LodgingBase = lodgingDecided
      ? {
          decided: true,
          destinationId:
            lodgingDestinationId === "" ? null : lodgingDestinationId,
        }
      : { decided: false };

    const result = validatePreferences({
      days: parseDays(days),
      origin,
      mobility,
      lodging,
      budget,
      interests,
      pace,
    });

    if (!result.ok) {
      const grouped = groupIssues(result.issues);
      setErrors(grouped);
      setValidated(null);
      focusFirstIssue(grouped);
      return;
    }

    setErrors({});
    setValidated(result.value);
  }

  const daysHintId = fieldId("days-hint");
  const daysErrorId = fieldId("days-error");
  const lodgingHintId = fieldId("lodging-hint");
  const lodgingErrorId = fieldId("lodging-error");
  const lodgingDestinationErrorId = fieldId("lodging-destination-error");
  const interestsHintId = fieldId("interests-hint");
  const interestsErrorId = fieldId("interests-error");

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId("days")} className="text-sm font-semibold">
          Cantidad de días
        </label>
        <input
          id={fieldId("days")}
          data-field="days"
          type="number"
          inputMode="numeric"
          min={TRIP_DAY_LIMITS.min}
          max={TRIP_DAY_LIMITS.max}
          step={1}
          value={days}
          onChange={(event) => setDays(event.target.value)}
          aria-invalid={Boolean(daysError)}
          aria-describedby={
            daysError ? `${daysHintId} ${daysErrorId}` : daysHintId
          }
          className="input w-full sm:max-w-40"
        />
        <p id={daysHintId} className="text-sm text-base-content/70">
          Entre {TRIP_DAY_LIMITS.min} y {TRIP_DAY_LIMITS.max} días.
        </p>
        <FieldError id={daysErrorId} message={daysError} />
      </div>

      <fieldset
        className="flex flex-col gap-2"
        role="radiogroup"
        aria-invalid={Boolean(originError)}
      >
        <legend className="text-sm font-semibold">Origen del viaje</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ORIGIN_KINDS.map((kind, index) => (
            <label
              key={kind}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-base-300 px-3 py-2 text-sm transition-colors hover:border-primary/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40"
            >
              <input
                type="radio"
                name="origin"
                value={kind}
                checked={originKind === kind}
                onChange={() => setOriginKind(kind)}
                data-field={index === 0 ? "origin" : undefined}
                aria-describedby={
                  originError ? fieldId("origin-error") : undefined
                }
                className="radio radio-primary radio-sm"
              />
              {ORIGIN_LABELS[kind]}
            </label>
          ))}
        </div>
        <FieldError id={fieldId("origin-error")} message={originError} />
      </fieldset>

      {originKind === "quebrada_locality" ? (
        <div className="flex flex-col gap-2 rounded-xl border border-base-300 p-3">
          <label
            htmlFor={fieldId("origin-destination")}
            className="text-sm font-semibold"
          >
            Localidad de origen
          </label>
          <select
            id={fieldId("origin-destination")}
            data-field="origin.destinationId"
            value={originDestinationId}
            onChange={(event) => setOriginDestinationId(event.target.value)}
            aria-invalid={Boolean(originDestinationError)}
            aria-describedby={
              originDestinationError
                ? fieldId("origin-destination-error")
                : undefined
            }
            className="select w-full"
          >
            <option value="">Elija una localidad</option>
            {CATALOGUE_DESTINATIONS.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.name}
              </option>
            ))}
          </select>
          <FieldError
            id={fieldId("origin-destination-error")}
            message={originDestinationError}
          />
        </div>
      ) : null}

      <ChoiceField
        legend="Movilidad"
        name="mobility"
        hint="Cómo prevé moverse entre localidades."
        options={MOBILITIES}
        labels={MOBILITY_LABELS}
        value={mobility}
        onChange={setMobility}
        error={errors.mobility}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">Alojamiento</legend>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            data-field="lodging"
            checked={lodgingDecided}
            onChange={(event) => setLodgingDecided(event.target.checked)}
            aria-invalid={Boolean(lodgingError)}
            aria-describedby={lodgingHintId}
            className="checkbox checkbox-primary checkbox-sm"
          />
          Ya tengo una base elegida para dormir
        </label>
        <p id={lodgingHintId} className="text-sm text-base-content/70">
          Si todavía no la eligió, el planificador propondrá bases según el
          resto de sus preferencias.
        </p>
        <FieldError id={lodgingErrorId} message={lodgingError} />
      </fieldset>

      {lodgingDecided ? (
        <div className="flex flex-col gap-2 rounded-xl border border-base-300 p-3">
          <label
            htmlFor={fieldId("lodging-destination")}
            className="text-sm font-semibold"
          >
            Localidad de la base
          </label>
          <select
            id={fieldId("lodging-destination")}
            data-field="lodging.destinationId"
            value={lodgingDestinationId}
            onChange={(event) => setLodgingDestinationId(event.target.value)}
            aria-invalid={Boolean(lodgingDestinationError)}
            aria-describedby={
              lodgingDestinationError
                ? lodgingDestinationErrorId
                : fieldId("lodging-destination-hint")
            }
            className="select w-full"
          >
            <option value="">Todavía sin definir</option>
            {CATALOGUE_DESTINATIONS.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.name}
              </option>
            ))}
          </select>
          <p
            id={fieldId("lodging-destination-hint")}
            className="text-sm text-base-content/70"
          >
            {lodgingDestinationId === ""
              ? "Sin localidad no se pueden ajustar los traslados; se mostrará como advertencia."
              : "Se usa como punto de partida para los traslados diarios."}
          </p>
          <FieldError
            id={lodgingDestinationErrorId}
            message={lodgingDestinationError}
          />
        </div>
      ) : null}

      <ChoiceField
        legend="Presupuesto"
        name="budget"
        hint="Nivel de gasto previsto, sin precios confirmados."
        options={BUDGET_LEVELS}
        labels={BUDGET_LABELS}
        value={budget}
        onChange={setBudget}
        error={errors.budget}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">Intereses</legend>
        <p id={interestsHintId} className="text-sm text-base-content/70">
          Elija al menos un interés.
        </p>
        <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
          {INTERESTS.map((interest, index) => (
            <label
              key={interest}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                data-field={index === 0 ? "interests" : undefined}
                checked={interests.includes(interest)}
                onChange={(event) =>
                  toggleInterest(interest, event.target.checked)
                }
                aria-invalid={Boolean(interestsError)}
                aria-describedby={
                  interestsError
                    ? `${interestsHintId} ${interestsErrorId}`
                    : interestsHintId
                }
                className="checkbox checkbox-primary checkbox-sm"
              />
              {INTEREST_LABELS[interest]}
            </label>
          ))}
        </div>
        <FieldError id={interestsErrorId} message={interestsError} />
      </fieldset>

      <ChoiceField
        legend="Ritmo"
        name="pace"
        hint="Cuánta actividad prefiere por día."
        options={PACES}
        labels={PACE_LABELS}
        value={pace}
        onChange={setPace}
        error={errors.pace}
      />

      <button type="submit" className="btn btn-primary self-start">
        Revisar preferencias
      </button>

      {validated ? (
        <section
          aria-live="polite"
          className="flex flex-col gap-3 rounded-2xl border border-success/40 bg-success/5 p-4"
        >
          <h2 className="text-lg font-semibold">Preferencias validadas</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <SummaryItem label="Días" value={String(validated.days)} />
            <SummaryItem
              label="Origen"
              value={originSummary(validated.origin)}
            />
            <SummaryItem
              label="Movilidad"
              value={MOBILITY_LABELS[validated.mobility]}
            />
            <SummaryItem
              label="Alojamiento"
              value={lodgingSummary(validated.lodging)}
            />
            <SummaryItem
              label="Presupuesto"
              value={BUDGET_LABELS[validated.budget]}
            />
            <SummaryItem label="Ritmo" value={PACE_LABELS[validated.pace]} />
            <SummaryItem
              label="Intereses"
              value={validated.interests
                .map((interest) => INTEREST_LABELS[interest])
                .join(", ")}
            />
          </dl>
          <p className="text-sm text-base-content/70">
            Las respuestas quedan cargadas en el formulario. La comparación de
            estrategias se habilita en el siguiente paso.
          </p>
        </section>
      ) : null}
    </form>
  );
}
