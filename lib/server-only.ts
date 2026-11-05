// Guard for modules that must never run in the browser.
//
// The `server-only` package would enforce this at build time, but it is an
// extra dependency and AGENTS.md §7 requires approval before adding one. This
// guard fails loudly at runtime instead: a Client Component that imports the
// database layer throws on first use instead of shipping it to the browser.

export function assertServerRuntime(feature: string): void {
  if (typeof window !== "undefined") {
    throw new Error(
      `${feature} is server-only. Do not import it from a Client Component.`,
    );
  }
}
