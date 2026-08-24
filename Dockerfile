# ATELIER storefront — production image (PostgreSQL).
#
# The app talks to PostgreSQL over the wire, so this image is stateless and
# works on any container platform. Point DATABASE_URL at your database
# (see docker-compose.yml for a local postgres service).

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
    HOSTNAME=0.0.0.0

EXPOSE 3000

# AUTH_SECRET and DATABASE_URL must be supplied at runtime. The app refuses to
# sign sessions with the placeholder secret in production.
CMD ["sh", "-c", "npm run db:deploy && npm start"]
