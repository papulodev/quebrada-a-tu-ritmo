import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";

const globalForDb = globalThis as unknown as { appPool?: Pool };

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Run `neon deploy` to pull it into .env.local.");
  }

  const pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
  });

  // Vercel Fluid compute reuses instances: release idle sockets before suspension.
  // Outside Vercel this is a no-op.
  attachDatabasePool(pool);

  return pool;
}

// Reuse the pool across hot reloads and serverless invocations.
export const pool = globalForDb.appPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.appPool = pool;
}
