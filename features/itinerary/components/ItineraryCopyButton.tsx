"use client";

// Copy action for the itinerary summary (QTR-025).
//
// Client leaf: the Clipboard API is the only browser capability the summary
// needs, so this is the only piece of the itinerary tree marked as client. The
// outcome is reported through a persistent status region instead of a toast, so
// the feedback does not depend on timers and survives assistive technology.

import { useState } from "react";

type CopyStatus = "idle" | "copied" | "error";

const COPY_LABEL = "Copiar resumen";

// The status region stays mounted and only changes its text: a live region
// created at the same moment it gets content is not announced reliably.
const FEEDBACK: Record<CopyStatus, { message: string; className: string }> = {
  idle: { message: "", className: "sr-only" },
  copied: { message: "Resumen copiado.", className: "text-sm text-success" },
  error: {
    message:
      "No se pudo copiar el resumen. Seleccione el texto y copielo manualmente.",
    className: "text-sm text-error",
  },
};

export function ItineraryCopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const feedback = FEEDBACK[status];

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="btn btn-outline btn-sm self-start"
        onClick={() => void copy()}
      >
        {COPY_LABEL}
      </button>
      <p role="status" className={feedback.className}>
        {feedback.message}
      </p>
    </div>
  );
}
