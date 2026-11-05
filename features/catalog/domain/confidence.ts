// Confidence metadata shared by every catalogue fact.
//
// A field that can change over time (duration, price, schedule) must never be
// presented as certain unless it was verified against a source. `null` means
// "unknown": never encode an unknown value as `0`, `false` or an empty string.

export const CONFIDENCE_STATUSES = [
  "verified",
  "estimated",
  "needs_verification",
] as const;

export type ConfidenceStatus = (typeof CONFIDENCE_STATUSES)[number];

export interface SourceReference {
  /** Human-readable source, e.g. "Ministerio de Turismo de Jujuy". */
  sourceName: string;
  sourceUrl: string | null;
  /** ISO 8601 date (YYYY-MM-DD) of the last manual check. */
  verifiedAt: string | null;
}

export function isConfidenceStatus(value: unknown): value is ConfidenceStatus {
  return (
    typeof value === "string" &&
    (CONFIDENCE_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * A duration is known only when it is a finite, non-negative number.
 * `null`, `undefined`, `NaN` and negative values all mean "unknown".
 */
export function isKnownDuration(
  value: number | null | undefined,
): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
