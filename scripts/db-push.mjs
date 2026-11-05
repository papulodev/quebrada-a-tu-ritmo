import { readFile } from "node:fs/promises";
import { Pool } from "pg";

console.warn(
  "Deprecated: db/migrations/ is the source of truth. Use `pnpm run db:migrate`.",
);

// Schema changes use the direct (non-pooled) connection.
const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set. Run `neon deploy` first.");
  process.exit(1);
}

const schemaUrl = new URL("../db/schema.sql", import.meta.url);
const sql = await readFile(schemaUrl, "utf8");
const pool = new Pool({ connectionString });

try {
  await pool.query(sql);
  console.log(`Schema applied to ${new URL(connectionString).hostname}`);
} finally {
  await pool.end();
}
