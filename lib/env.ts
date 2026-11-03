// Server-only environment access.
//
// Values are resolved lazily on first use instead of at module evaluation:
// `next build` imports route handlers and the proxy to collect their config,
// and that step must not require runtime secrets.

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

export function neonAuthBaseUrl(): string {
  return requireEnv("NEON_AUTH_BASE_URL");
}

export function neonAuthCookieSecret(): string {
  const secret = requireEnv("NEON_AUTH_COOKIE_SECRET");

  if (secret.length < 32) {
    throw new Error(
      "NEON_AUTH_COOKIE_SECRET must be set to at least 32 characters. Generate one with `openssl rand -base64 32`.",
    );
  }

  return secret;
}
