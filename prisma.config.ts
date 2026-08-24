import { existsSync } from 'node:fs'
import { defineConfig } from 'prisma/config'

// Prisma 7 no longer auto-loads .env for CLI commands, so do it explicitly.
// `process.loadEnvFile` is built into Node 20.12+/22 and does not clobber
// variables that are already set in the environment.
if (existsSync('.env')) process.loadEnvFile('.env')

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
})
