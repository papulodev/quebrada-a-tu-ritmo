import { createNeonAuth } from "@neondatabase/auth/next/server";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const secret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!baseUrl) {
  throw new Error("NEON_AUTH_BASE_URL is not set. Run `neon deploy` to pull it into .env.local.");
}

if (!secret || secret.length < 32) {
  throw new Error(
    "NEON_AUTH_COOKIE_SECRET must be set to at least 32 characters. Generate one with `openssl rand -base64 32`.",
  );
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: { secret },
});
