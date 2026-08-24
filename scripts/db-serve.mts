/**
 * Local PostgreSQL for development — PGlite (real PostgreSQL compiled to WASM)
 * exposed over the Postgres wire protocol.
 *
 * This exists so the exact production code path (`@prisma/adapter-pg` talking
 * to a postgres:// URL) can run on a laptop or in CI with no native PostgreSQL
 * install. Point DATABASE_URL at a real hosted database for production.
 *
 * Usage: npm run db:serve
 */
import { PGlite } from '@electric-sql/pglite'
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'

/**
 * `@electric-sql/pglite-socket` and `@electric-sql/pglite` form a circular
 * import, so the package's named ESM export is undefined at module scope.
 * Requiring the CJS build works — but note esbuild rewrites a *destructuring*
 * require back into a named import, so the class must be read with member
 * access. That is not a style choice; destructuring here yields `undefined`.
 */
const require = createRequire(import.meta.url)
const socketModule = require('@electric-sql/pglite-socket') as {
  PGLiteSocketServer: new (options: {
    db: PGlite
    port: number
    host: string
    maxConnections?: number
  }) => { start(): Promise<void>; stop(): Promise<void> }
}
const PGliteSocketServer = socketModule.PGLiteSocketServer

const dataDir = process.env.PGLITE_DATA_DIR ?? './data/pg'
const port = Number(process.env.PGLITE_PORT ?? 5433)
const host = process.env.PGLITE_HOST ?? '127.0.0.1'

// PGlite's node fs backend does not create parent directories itself.
mkdirSync(dataDir, { recursive: true })

const db = new PGlite(dataDir)
await db.waitReady

const server = new PGliteSocketServer({
  db,
  port,
  host,
  // Prisma pools connections; the default of 1 would serialise everything.
  maxConnections: Number(process.env.PGLITE_MAX_CONNECTIONS ?? 10),
})

await server.start()

console.log(`PostgreSQL ${await serverVersion(db)} (PGlite) listening on:`)
console.log(`  postgresql://postgres:postgres@${host}:${port}/postgres`)
console.log(`  data directory: ${dataDir}`)
console.log('Press Ctrl+C to stop.')

async function serverVersion(database: PGlite): Promise<string> {
  const result = await database.query<{ server_version: string }>('SHOW server_version')
  return result.rows[0]?.server_version ?? 'unknown'
}

const shutdown = async () => {
  await server.stop()
  await db.close()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
