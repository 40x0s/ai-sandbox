/**
 * Applies committed .sql migrations to the configured PostgreSQL database.
 *
 * `prisma migrate deploy` does the same thing, but it needs Prisma's
 * schema-engine binary (downloaded from binaries.prisma.sh), which is blocked
 * on restricted networks. This script only needs the connection string, so it
 * also runs inside CI and in the Docker image.
 *
 * Applied migrations are recorded in `_applied_migrations`, which makes it safe
 * to run on every container start.
 *
 * Usage:
 *   npx tsx scripts/apply-sql.mts prisma/migrations            # every migration, in order
 *   npx tsx scripts/apply-sql.mts prisma/migrations --baseline # record without executing
 */
import '../src/lib/env'
import { Client } from 'pg'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const baseline = process.argv.includes('--baseline')
const target = process.argv[2]

if (!target || !existsSync(target)) {
  console.error('usage: tsx scripts/apply-sql.mts <migrations-dir | path-to-file.sql> [--baseline]')
  process.exit(1)
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set — copy .env.example to .env first.')
  process.exit(1)
}

function collectMigrationFiles(path: string): { name: string; file: string }[] {
  if (!statSync(path).isDirectory()) {
    return [{ name: path.split('/').slice(-2, -1)[0] ?? path, file: path }]
  }

  return readdirSync(path)
    .filter((entry) => statSync(join(path, entry)).isDirectory())
    .sort() // migration folders are numbered, so lexical order is apply order
    .map((entry) => ({ name: entry, file: join(path, entry, 'migration.sql') }))
    .filter((migration) => existsSync(migration.file))
}

const migrations = collectMigrationFiles(target)
if (migrations.length === 0) {
  console.error(`No migrations found under ${target}`)
  process.exit(1)
}

const client = new Client({ connectionString })
await client.connect()

try {
  await client.query(
    `CREATE TABLE IF NOT EXISTS _applied_migrations (
       name TEXT PRIMARY KEY,
       applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
     )`,
  )

  const { rows } = await client.query<{ name: string }>('SELECT name FROM _applied_migrations')
  const alreadyApplied = new Set(rows.map((row) => row.name))

  let applied = 0
  for (const migration of migrations) {
    if (alreadyApplied.has(migration.name)) {
      console.log(`  skip     ${migration.name} (already applied)`)
      continue
    }

    if (baseline) {
      await client.query('INSERT INTO _applied_migrations (name) VALUES ($1)', [migration.name])
      console.log(`  baseline ${migration.name} (recorded, not executed)`)
      continue
    }

    try {
      await client.query('BEGIN')
      await client.query(readFileSync(migration.file, 'utf8'))
      await client.query('INSERT INTO _applied_migrations (name) VALUES ($1)', [migration.name])
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      const message = error instanceof Error ? error.message : String(error)
      if (/already exists/i.test(message)) {
        console.error(
          `\n${migration.name} looks already applied but is not recorded in _applied_migrations.\n` +
            `If this database predates the tracker, re-run with --baseline:\n\n` +
            `  npx tsx scripts/apply-sql.mts ${target} --baseline\n`,
        )
        process.exit(1)
      }
      throw error
    }

    console.log(`  applied  ${migration.name}`)
    applied += 1
  }

  const tables = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
  )
  console.log(
    `${applied} migration(s) applied. ${tables.rowCount} tables: ${tables.rows
      .map((row: { tablename: string }) => row.tablename)
      .join(', ')}`,
  )
} finally {
  await client.end()
}
