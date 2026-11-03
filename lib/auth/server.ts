import { createNeonAuth } from "@neondatabase/auth/next/server";
import { neonAuthBaseUrl, neonAuthCookieSecret } from "@/lib/env";

type NeonAuth = ReturnType<typeof createNeonAuth>;

const globalForAuth = globalThis as unknown as { neonAuth?: NeonAuth };

// Created on first use: `next build` imports route handlers and the proxy to
// collect their config, and that step must not require runtime secrets.
export function getAuth(): NeonAuth {
  globalForAuth.neonAuth ??= createNeonAuth({
    baseUrl: neonAuthBaseUrl(),
    cookies: { secret: neonAuthCookieSecret() },
  });

  return globalForAuth.neonAuth;
}
