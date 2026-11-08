import type { Metadata } from "next";
import Link from "next/link";

import { PlannerForm } from "../../features/planner/components/PlannerForm";

export const metadata: Metadata = {
  title: "Planificador",
};

export default function PlannerPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Planificador de viaje
        </h1>
        <p className="text-lg text-base-content/70">
          Indique cómo quiere recorrer la Quebrada para comparar estrategias con
          datos transparentes.
        </p>
      </header>
      <PlannerForm />
      <Link href="/" className="link link-hover self-start text-sm">
        Volver al inicio
      </Link>
    </main>
  );
}
