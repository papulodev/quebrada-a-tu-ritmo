// Server-only environment access.
//
// Values are resolved lazily on first use instead of at module evaluation:
// `next build` imports route handlers and pages to collect their config, and
// that step must not require runtime secrets.

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not set. Add it to .env.local; see .env.example.`);
  }

  return value;
}

export function databaseUrl(): string {
  return requireEnv("DATABASE_URL");
}
