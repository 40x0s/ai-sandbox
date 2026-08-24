/**
 * Loads `.env` for anything run outside Next.js (the seed script, the migration
 * applier, db-query). Next.js already loads .env itself, and
 * `process.loadEnvFile` never overrides variables that are already set, so this
 * is a no-op inside Next and in production containers (where .env is absent).
 */
import { existsSync } from 'node:fs'

if (existsSync('.env')) {
  process.loadEnvFile('.env')
}

export {}
