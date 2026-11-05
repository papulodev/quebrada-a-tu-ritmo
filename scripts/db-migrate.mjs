// Minimal versioned migration runner (QTR-008).
//
// Applies every pending file in db/migrations/ exactly once, in filename order,
// inside a transaction, and records it in schema_migrations. No migration tool
// dependency: `pg` is already part of the stack.
//
// Usage: pnpm run db:migrate
// Schema changes use the direct (non-pooled) connection when available.

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { Client } from "pg";

const MIGRATION_FILE = /^\d{4}_[a-z0-9_]+\.sql$/;
const ADVISORY_LOCK_KEY = 4_851_273;

const connectionString = (
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
)?.trim();

if (!connectionString) {
  console.error(
    "DATABASE_URL_UNPOOLED or DATABASE_URL must be set. See .env.example and README.md.",
  );
  process.exit(1);
}

function fail(message) {
  console.error(`Migration failed: ${message}`);
  process.exit(1);
}

const migrationsDir = new URL("../db/migrations/", import.meta.url);
const entries = (await readdir(migrationsDir))
  .filter((name) => name.endsWith(".sql"))
  .sort();

const migrations = [];
for (const name of entries) {
  if (!MIGRATION_FILE.test(name)) {
    fail(`invalid migration filename "${name}" (expected NNNN_name.sql)`);
  }

  const sql = (await readFile(new URL(name, migrationsDir), "utf8")).replace(
    /^\uFEFF/,
    "",
  );

  migrations.push({
    version: name.slice(0, -4),
    name,
    checksum: createHash("sha256").update(sql).digest("hex"),
    sql,
  });
}

const seen = new Set();
for (const { version } of migrations) {
  if (seen.has(version)) fail(`duplicate migration version ${version}`);
  seen.add(version);
}

const client = new Client({ connectionString });

try {
  await client.connect();
  await client.query("SELECT pg_advisory_lock($1)", [ADVISORY_LOCK_KEY]);

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      name text NOT NULL,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await client.query(
    "SELECT version, name, checksum FROM schema_migrations ORDER BY version",
  );
  const applied = new Map(rows.map((row) => [row.version, row]));

  for (const migration of migrations) {
    const previous = applied.get(migration.version);
    if (previous && previous.checksum !== migration.checksum) {
      fail(
        `${migration.name} changed after it was applied; create a new migration instead of editing history`,
      );
    }
  }

  for (const row of rows) {
    if (!seen.has(row.version)) {
      fail(
        `${row.name} was applied but is missing from db/migrations/; restore the file`,
      );
    }
  }

  const pending = migrations.filter(({ version }) => !applied.has(version));

  if (pending.length === 0) {
    console.log("No pending migrations.");
  }

  for (const migration of pending) {
    await client.query("BEGIN");
    try {
      await client.query(migration.sql);
      await client.query(
        "INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3)",
        [migration.version, migration.name, migration.checksum],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }

    console.log(`Applied ${migration.name}`);
  }

  if (pending.length > 0) {
    console.log(`${pending.length} migration(s) applied.`);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
} finally {
  try {
    await client.query("SELECT pg_advisory_unlock($1)", [ADVISORY_LOCK_KEY]);
  } catch {
    // Connection may already be unusable; the lock is released with the session.
  }
  await client.end().catch(() => {});
}
