# ATELIER — a modern clothing storefront

Full-stack e-commerce demo built with **Next.js (App Router) + Tailwind CSS v4 + Prisma 7 + SQLite**.

Steps 1–3 are complete: project scaffold, database foundation, root layout and the landing page
(hero, promo banners, category strip, featured products, value props, header + footer).

---

## 1. Terminal commands

```bash
# --- scaffold (Next.js 16, TypeScript, Tailwind v4, App Router, src/ dir, @/* alias)
npx create-next-app@16.3.2 storefront \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm --yes

cd storefront

# --- database: Prisma ORM + SQLite
npm install @prisma/client@7 @prisma/adapter-libsql @libsql/client
npm install -D prisma@7 tsx

# --- auth + validation (used from the auth step onwards)
npm install bcryptjs jose zod

# --- font bundle (ships the font files locally, no build-time Google Fonts fetch)
npm install geist

# --- database setup
cp .env.example .env
npm run db:generate          # generate the Prisma Client
npm run db:migrate -- --name init   # create the SQLite DB + first migration
npm run db:seed              # 7 products, 3 categories, 2 demo users

# --- run
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`,
`npm run db:studio`, `npm run db:setup`.

### Offline / restricted networks

`prisma migrate dev` and `prisma generate` download the **schema-engine** binary from
`binaries.prisma.sh`. If that host is unreachable (corporate proxies, offline CI), use:

```bash
npm run db:setup:offline
```

which applies the committed `prisma/migrations/0001_init/migration.sql` directly through
`node:sqlite` and then seeds — the same DDL, the same resulting database. The runtime
**query compiler is bundled inside `@prisma/client` as WASM**, so the app itself never needs
`binaries.prisma.sh`.

---

## 2. Folder structure

```
.
├── prisma/
│   ├── schema.prisma                    # User, Category, Color, Size, Product, Order, OrderItem
│   ├── migrations/0001_init/            # initial SQLite DDL
│   ├── seed.ts                          # idempotent demo data + hashed demo users
│   └── dev.db                           # local SQLite file (gitignored)
├── public/images/                       # hero, promo banners, product photography
├── scripts/
│   └── apply-sql.mts                    # offline migration applier
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # root layout: fonts, metadata, header/footer, skip link
│   │   ├── page.tsx                     # landing page (server component)
│   │   ├── globals.css                  # Tailwind v4 theme tokens + base styles
│   │   ├── catalog/  cart/  login/  register/  products/[slug]/
│   │   └── favicon.ico
│   ├── components/
│   │   ├── home/       Hero, PromoBanners, CategoryStrip, FeaturedProducts, ValueProps
│   │   ├── layout/     SiteHeader, SiteFooter, NewsletterForm
│   │   ├── product/    ProductCard
│   │   └── ui/         icons, ComingSoon
│   ├── generated/prisma/                # generated Prisma Client (committed, see note below)
│   └── lib/
│       ├── prisma.ts                    # PrismaClient singleton + libsql driver adapter
│       ├── products.ts                  # data-access layer used by pages
│       └── format.ts                    # cents → currency, discount maths
├── prisma.config.ts                     # Prisma 7 CLI config (datasource URL, seed command)
├── next.config.ts
└── package.json
```

`src/generated/prisma` is committed on purpose so the project builds on machines that cannot
reach `binaries.prisma.sh`. Re-generate after any schema change with `npm run db:generate`.

---

## 3. Demo accounts

| Role     | Email              | Password  |
| -------- | ------------------ | --------- |
| Admin    | `admin@store.test` | `admin123`|
| Customer | `demo@store.test`  | `demo123` |

Passwords are stored as bcrypt hashes, never in plain text.

---

## Notes on this codebase

- **Money is integer cents** (`price`, `subtotal`, `total`) — no float rounding on totals.
- **SQLite has no enums or scalar lists**, so `role`/`status` are strings and sizes/colours are
  relation tables (`_ProductToSize`, `_ColorToProduct`).
- **Prisma 7 requires a driver adapter**: `new PrismaClient({ adapter: new PrismaLibSql({ url }) })`.
  The connection URL lives in `prisma.config.ts` (CLI) and the adapter (runtime) — not in the
  schema file, which Prisma 7 rejects.
- **Pages read through `src/lib/products.ts`**, never through Prisma directly, so query shapes
  stay in one place.
- Images are local files under `public/images` (the network in this environment blocks image
  CDNs). Add a `remotePatterns` entry in `next.config.ts` if you switch to hosted URLs.

---

## Roadmap

- [x] 1. Scaffold, tooling, dependencies
- [x] 2. Folder structure
- [x] 3. Root layout + landing page (hero, promo banners, featured products)
- [ ] 4. Catalogue with category / size / colour / price filters
- [ ] 5. Product detail page + cart (Context API, localStorage)
- [ ] 6. Checkout simulation (order persisted to SQLite)
- [ ] 7. Auth: register / login, JWT session cookie, route guards
- [ ] 8. Admin dashboard: product CRUD behind an admin guard
