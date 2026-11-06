// Server-only environment access.
//
// Values are resolved lazily on first use instead of at module evaluation:
// `next build` imports route handlers and pages to collect their config, and
// that step must not require runtime secrets.

/** Raised when a required server variable is missing or blank. */
export class MissingEnvironmentVariableError extends Error {
  constructor(readonly variable: string) {
    // The message never includes the value, so it is safe to log.
    super(
      `${variable} is not set. Add it to .env.local; see .env.example and the "Base de datos" section of README.md.`,
    );
    this.name = "MissingEnvironmentVariableError";
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new MissingEnvironmentVariableError(name);
  }

  return value;
}

export function databaseUrl(): string {
  return requireEnv("DATABASE_URL");
}
