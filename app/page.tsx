import type { Metadata } from "next";
import Link from "next/link";

import { CONFIDENCE_BADGES } from "../features/itinerary/domain/presentation";

export const metadata: Metadata = {
  description:
    "Compare estrategias para recorrer la Quebrada de Humahuaca y reciba un itinerario realista por día, con datos logísticos y su estado de verificación a la vista.",
};

const DECISIONS = [
  "cuántos días dedicar a cada pueblo",
  "si conviene moverse en auto",
  "cuánto insume cada traslado",
  "qué actividad conviene dejar afuera",
  "cómo repartir el ritmo de cada jornada",
];

const STEPS = [
  {
    title: "Cuente su viaje",
    description:
      "Indique desde dónde llega, cuántos días tiene, cómo piensa moverse, su presupuesto, el ritmo que prefiere y qué le interesa conocer.",
  },
  {
    title: "Compare estrategias",
    description:
      "El comparador evalúa cuatro formas de recorrer la Quebrada —Excursiones desde Salta, Base en la Quebrada, Recorrido con movilidad propia o combinada y Tren Solar— con sus tiempos y sus límites.",
  },
  {
    title: "Reciba su itinerario",
    description:
      "Obtenga un plan día por día con duraciones estimadas, advertencias y las actividades que quedaron fuera, junto con el motivo de cada descarte.",
  },
];

const PROFILES = [
  "Quien llega desde Salta y evalúa excursiones",
  "Familias y grupos con dos o tres días y ritmo moderado",
  "Quien viaja con auto propio",
  "Quien busca cultura, paisaje y gastronomía",
  "Quien llega desde otra provincia o del exterior",
  "Quien quiere moverse con el Tren Solar",
];

const CONFIDENCE_BADGES_LIST = [
  CONFIDENCE_BADGES.verified,
  CONFIDENCE_BADGES.estimated,
  CONFIDENCE_BADGES.needs_verification,
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-16 px-6 py-16">
      <section className="flex flex-col gap-6">
        <span className="badge badge-outline w-fit">Quebrada de Humahuaca</span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Planifique la Quebrada a su ritmo
        </h1>
        <p className="max-w-2xl text-lg text-base-content/70">
          Días, traslados y altura: el planificador compara estrategias de viaje
          y arma un itinerario realista por día. Sin registro y sin reservas.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/planner" className="btn btn-primary">
            Planificar mi viaje
          </Link>
          <a href="#como-funciona" className="link link-hover text-sm">
            Ver cómo funciona
          </a>
        </div>
        <p className="max-w-2xl text-sm text-base-content/70">
          Gratis y sin cuenta. Cada dato logístico muestra su estado de
          verificación.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Planificar la Quebrada tiene más variables de las que parece
        </h2>
        <p className="max-w-2xl text-base-content/70">
          Las respuestas cambian según el origen, la movilidad disponible y el
          tiempo real de cada jornada. Sin un plan explícito, es fácil terminar
          con días desbalanceados o con traslados que no cierran.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {DECISIONS.map((decision) => (
            <li
              key={decision}
              className="rounded-2xl border border-base-300 p-4 text-sm"
            >
              {decision}
            </li>
          ))}
        </ul>
      </section>

      <section id="como-funciona" className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold tracking-tight">Cómo funciona</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-2 rounded-2xl border border-base-300 p-5"
            >
              <span className="badge badge-neutral w-fit">
                Paso {index + 1}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-base-content/70">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Datos con su estado a la vista
        </h2>
        <p className="max-w-2xl text-base-content/70">
          El itinerario no inventa horarios ni disponibilidad. Cada dato indica
          si está verificado, si es una estimación o si todavía debe
          confirmarse.
        </p>
        <ul className="flex flex-wrap gap-2">
          {CONFIDENCE_BADGES_LIST.map((badge) => (
            <li key={badge.label}>
              <span className={`badge ${badge.className}`}>{badge.label}</span>
            </li>
          ))}
        </ul>
        <p className="max-w-2xl text-sm text-base-content/70">
          Las duraciones son estimaciones de referencia: no se confirman
          horarios, frecuencias ni disponibilidad de transporte, y no se
          gestionan reservas. Los avisos de altura son generales y no
          reemplazan consejo médico.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Pensado para distintos viajes
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PROFILES.map((profile) => (
            <li key={profile} className="text-sm text-base-content/70">
              {profile}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Empiece por contar su viaje
        </h2>
        <p className="max-w-2xl text-base-content/70">
          Toma unos minutos y no necesita cuenta ni datos de contacto.
        </p>
        <Link href="/planner" className="btn btn-primary w-fit">
          Planificar mi viaje
        </Link>
      </section>
    </main>
  );
}
