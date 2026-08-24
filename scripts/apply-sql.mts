/**
 * Applies committed .sql migrations to the dev database.
 *
 * This exists because the Prisma CLI's schema-engine binary is downloaded from
 * binaries.prisma.sh, which is not reachable in restricted/offline networks.
 * On a normal machine you don't need this script at all:
 *
 *     npx prisma migrate deploy
 *
 * The SQL applied here is byte-for-byte the committed migration files, so the
 * resulting database is the same one `prisma migrate deploy` would produce.
 * Applied migrations are recorded in `_applied_migrations`, which makes this
 * safe to run on every container start.
 *
 * Usage:
 *   npx tsx scripts/apply-sql.mts prisma/migrations            # every migration, in order
 *   npx tsx scripts/apply-sql.mts prisma/migrations/0001_init/migration.sql
 */
import { DatabaseSync } from 'node:sqlite'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'

const baseline = process.argv.includes('--baseline')
const target = process.argv[2]
if (!target || !existsSync(target)) {
  console.error('usage: tsx scripts/apply-sql.mts <migrations-dir | path-to-file.sql>')
  process.exit(1)
}

function collectMigrationFiles(path: string): { name: string; file: string }[] {
  if (!statSync(path).isDirectory()) {
    return [{ name: dirname(path).split('/').pop() ?? path, file: path }]
  }

  return readdirSync(path)
    .filter((entry) => statSync(join(path, entry)).isDirectory())
    .sort() // migration folders are numbered, so lexical order is apply order
    .map((entry) => ({ name: entry, file: join(path, entry, 'migration.sql') }))
    .filter((migration) => existsSync(migration.file))
}

const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
if (!url.startsWith('file:')) {
  console.error(`Only local SQLite files are supported here, got: ${url}`)
  process.exit(1)
}
const dbPath = url.slice('file:'.length)

const migrations = collectMigrationFiles(target)
if (migrations.length === 0) {
  console.error(`No migrations found under ${target}`)
  process.exit(1)
}

mkdirSync(dirname(dbPath) || '.', { recursive: true })

const db = new DatabaseSync(dbPath)
db.exec('PRAGMA foreign_keys = ON')
db.exec(
  `CREATE TABLE IF NOT EXISTS _applied_migrations (
     name TEXT PRIMARY KEY,
     applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
   )`,
)

const alreadyApplied = new Set(
  db
    .prepare('SELECT name FROM _applied_migrations')
    .all()
    .map((row: unknown) => (row as { name: string }).name),
)

let applied = 0
for (const migration of migrations) {
  if (alreadyApplied.has(migration.name)) {
    console.log(`  skip    ${migration.name} (already applied)`)
    continue
  }

  if (baseline) {
    // Record without executing — for databases created before this tracker existed.
    db.prepare('INSERT INTO _applied_migrations (name) VALUES (?)').run(migration.name)
    console.log(`  baseline ${migration.name} (recorded, not executed)`)
    continue
  }

  try {
    db.exec(readFileSync(migration.file, 'utf8'))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/already exists/i.test(message)) {
      console.error(
        `\n${migration.name} looks already applied but is not recorded in _applied_migrations.\n` +
          `If this database predates the tracker, re-run with --baseline to record existing\n` +
          `migrations without executing them:\n\n` +
          `  npx tsx scripts/apply-sql.mts ${target} --baseline\n`,
      )
      process.exit(1)
    }
    throw error
  }

  db.prepare('INSERT INTO _applied_migrations (name) VALUES (?)').run(migration.name)
  console.log(`  applied ${migration.name}`)
  applied += 1
}

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
  .all()
  .map((row: unknown) => (row as { name: string }).name)

db.close()
console.log(
  `${applied} migration(s) applied. Database ${dbPath} now has ${tables.length} tables.`,
)
