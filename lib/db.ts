import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { databaseUrl } from "@/lib/env";

const globalForDb = globalThis as unknown as { appPool?: Pool };

function createPool() {
  const pool = new Pool({
    connectionString: databaseUrl(),
    max: 5,
    idleTimeoutMillis: 30_000,
  });

  // Vercel Fluid compute reuses instances: release idle sockets before suspension.
  // Outside Vercel this is a no-op.
  attachDatabasePool(pool);

  return pool;
}

// Created on first use: `next build` collects route handlers and must not need
// a database connection string to do so. Reused across hot reloads and
// serverless invocations.
export function getPool(): Pool {
  globalForDb.appPool ??= createPool();

  return globalForDb.appPool;
}
