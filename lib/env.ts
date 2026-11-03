// Server-only environment access.
//
// Values are resolved lazily on first use instead of at module evaluation:
// `next build` imports route handlers and pages to collect their config, and
// that step must not require runtime secrets.

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set. Run \`neon deploy\` to pull it into .env.local.`);
  }

  return value;
}

export function databaseUrl(): string {
  return requireEnv("DATABASE_URL");
}
