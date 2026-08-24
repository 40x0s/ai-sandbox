import { PrismaClient } from '../generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'

// Relative import (not the `@/` alias) so this module works both inside
// Next.js and when executed directly by tsx (prisma seed).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  return new PrismaClient({
    adapter: new PrismaLibSql({ url }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createClient()

// Avoid exhausting SQLite connections during `next dev` hot reloads.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { PrismaClient }
export type { Prisma } from '../generated/prisma/client'
