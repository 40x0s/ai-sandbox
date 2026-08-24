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
 *
 * Usage:
 *   npx tsx scripts/apply-sql.mts prisma/migrations            # every migration, in order
 *   npx tsx scripts/apply-sql.mts prisma/migrations/0001_init/migration.sql
 */
import { DatabaseSync } from 'node:sqlite'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const target = process.argv[2]
if (!target || !existsSync(target)) {
  console.error('usage: tsx scripts/apply-sql.mts <migrations-dir | path-to-file.sql>')
  process.exit(1)
}

function collectMigrationFiles(path: string): string[] {
  if (!statSync(path).isDirectory()) return [path]

  return readdirSync(path)
    .filter((entry) => statSync(join(path, entry)).isDirectory())
    .sort() // migration folders are numbered, so lexical order is apply order
    .map((entry) => join(path, entry, 'migration.sql'))
    .filter((file) => existsSync(file))
}

const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
if (!url.startsWith('file:')) {
  console.error(`Only local SQLite files are supported here, got: ${url}`)
  process.exit(1)
}
const dbPath = url.slice('file:'.length)

const files = collectMigrationFiles(target)
if (files.length === 0) {
  console.error(`No migrations found under ${target}`)
  process.exit(1)
}

const db = new DatabaseSync(dbPath)
db.exec('PRAGMA foreign_keys = ON')

for (const file of files) {
  db.exec(readFileSync(file, 'utf8'))
  console.log(`  applied ${file}`)
}

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
  .all()
  .map((row: unknown) => (row as { name: string }).name)

db.close()
console.log(`Database ${dbPath} has ${tables.length} tables: ${tables.join(', ')}`)
