/**
 * Applies a committed .sql file to the dev database.
 *
 * This exists because the Prisma CLI's schema-engine binary is downloaded from
 * binaries.prisma.sh, which is not reachable in restricted/offline networks.
 * On a normal machine you don't need this script at all:
 *
 *     npx prisma migrate dev --name init
 *
 * The SQL applied here is byte-for-byte the committed migration file, so the
 * resulting database is the same one `prisma migrate deploy` would produce.
 *
 * Usage: npx tsx scripts/apply-sql.mts prisma/migrations/0001_init/migration.sql
 */
import { DatabaseSync } from 'node:sqlite'
import { existsSync, readFileSync } from 'node:fs'

const file = process.argv[2]
if (!file || !existsSync(file)) {
  console.error('usage: tsx scripts/apply-sql.mts <path-to-file.sql>')
  process.exit(1)
}

const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
if (!url.startsWith('file:')) {
  console.error(`Only local SQLite files are supported here, got: ${url}`)
  process.exit(1)
}
const path = url.slice('file:'.length)

const sql = readFileSync(file, 'utf8')
const db = new DatabaseSync(path)
db.exec('PRAGMA foreign_keys = ON')
db.exec(sql)

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
  .all()
  .map((row: unknown) => (row as { name: string }).name)

db.close()
console.log(`Applied ${file} to ${path}`)
console.log(`Tables: ${tables.join(', ')}`)
