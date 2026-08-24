/**
 * Runs one SQL statement against the configured database and prints the result
 * as JSON. Used by scripts/e2e.sh to assert on database state.
 *
 * Usage: npx tsx scripts/db-query.mts "SELECT count(*) FROM \"Product\""
 */
import '../src/lib/env'
import { Client } from 'pg'

const sql = process.argv[2]
if (!sql) {
  console.error('usage: tsx scripts/db-query.mts "<SQL>"')
  process.exit(1)
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set.')
  process.exit(1)
}

const client = new Client({ connectionString })
await client.connect()

try {
  const result = await client.query(sql)
  const rows = result.rows ?? []
  if (rows.length === 1 && Object.keys(rows[0]).length === 1) {
    // Single scalar — print it bare so shell tests can compare directly.
    process.stdout.write(String(Object.values(rows[0])[0]))
  } else {
    process.stdout.write(JSON.stringify(rows))
  }
} finally {
  await client.end()
}
