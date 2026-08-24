# ATELIER storefront — production image.
#
# SQLite lives on a named volume (/app/data), so this image is safe to run on
# any container host with persistent storage (Fly.io, Railway, Render, a VPS).
# It is NOT suitable for serverless platforms, whose filesystems are ephemeral —
# there, move to Postgres (see README "Production readiness").

FROM node:22-alpine

WORKDIR /app

# Dependencies first so the layer is cached across code changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# The Prisma Client is committed, so no engine download is needed at build time.
RUN npm run build

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL="file:/app/data/atelier.db"

RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3000

# AUTH_SECRET must be supplied at runtime (the app refuses to sign sessions
# with the placeholder value in production).
CMD ["sh", "-c", "npm run db:setup:offline && npm start"]
