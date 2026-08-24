// Must be the first import: it populates process.env for scripts run through
// tsx, before anything below reads DATABASE_URL.
import './env'

import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Single PrismaClient for the whole app.
 *
 * The driver is PostgreSQL via node-postgres, so the same code runs against a
 * local PGlite server (scripts/db-serve.mts), a Dockerised postgres:16, or a
 * hosted database on Neon/Supabase/RDS — only DATABASE_URL changes.
 */

const connectionString = process.env.DATABASE_URL

// Relative import (not the `@/` alias) so this module works both inside
// Next.js and when executed directly by tsx (seed and migration scripts).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and point it at a PostgreSQL database.',
    )
  }

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      // Serverless platforms close idle sockets; keep the pool small and let
      // it reconnect rather than holding dead connections.
      max: Number(process.env.PG_POOL_MAX ?? 5),
    }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createClient()

// Avoid exhausting database connections during `next dev` hot reloads.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { PrismaClient }
export type { Prisma } from '../generated/prisma/client'
