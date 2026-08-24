# ATELIER — a complete clothing storefront

Full-stack e-commerce app: **Next.js 16 (App Router) · Tailwind CSS v4 · Prisma 7 · SQLite**.

Everything in the feature list below is implemented and verified end-to-end
(`bash scripts/e2e.sh` → **37 passed, 0 failed**).

| Area | What's built |
| --- | --- |
| Landing page | Hero, promo banners, category strip, featured products, value props |
| Catalogue | `/catalog` with category / size / colour / price / sale filters + 5 sort modes, all in the URL |
| Product page | `/products/[slug]` with size & colour selectors, stock state, quantity, related products |
| Cart | Context store persisted to `localStorage`, live header badge, quantity controls, free-shipping meter |
| Checkout | `/checkout` → `POST /api/orders` (server-side re-pricing + stock checks) → `/checkout/success` |
| Auth | Register / login with bcrypt hashes and a signed `jose` JWT session cookie |
| Admin | `/admin` product list, stats, create / edit / delete — behind an admin guard |

---

## 1. Setup

```bash
npx create-next-app@16.3.2 storefront \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm --yes
cd storefront

npm install @prisma/client@7 @prisma/adapter-libsql @libsql/client  # SQLite driver (pure WASM)
npm install -D prisma@7 tsx
npm install bcryptjs jose zod geist

cp .env.example .env
npm run db:generate
npm run db:migrate -- --name init     # create prisma/dev.db
npm run db:seed                       # 7 products, 3 categories, 2 demo users

npm run dev                           # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint · `tsc --noEmit` |
| `npm run db:generate` | Regenerate the Prisma Client after schema changes |
| `npm run db:migrate` / `db:deploy` | Create / apply migrations |
| `npm run db:seed` | Seed demo data (idempotent) |
| `npm run db:studio` | Prisma Studio |
| `npm run db:setup` | Migrate + seed |
| `npm run db:setup:offline` | Same, but applies the committed SQL without the Prisma CLI |
| `bash scripts/e2e.sh` | End-to-end smoke test against a running dev server |

## 2. Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@store.test` | `admin123` |
| Customer | `demo@store.test` | `demo123` |

The admin account is what unlocks `/admin`. Passwords are stored as bcrypt hashes.

## 3. Routes

**Storefront** — `/`, `/catalog`, `/products/[slug]`, `/cart`, `/checkout`, `/checkout/success`,
`/login`, `/register`

**Admin (guarded)** — `/admin`, `/admin/products/new`, `/admin/products/[id]/edit`

**API** — `POST /api/auth/{register,login,logout}` · `POST /api/orders` ·
`POST /api/admin/products` · `PATCH|DELETE /api/admin/products/[id]`

## 4. Folder structure

```
prisma/
  schema.prisma                  User, Category, Color, Size, Product, Order, OrderItem
  migrations/0001_init/          initial SQLite DDL
  seed.ts                        idempotent demo data + hashed demo users
  dev.db                         local SQLite file (gitignored)
public/images/                   hero, promo banners, product photography
scripts/
  apply-sql.mts                  offline migration applier
  e2e.sh                         37-assertion end-to-end smoke test
src/
  app/
    layout.tsx                   fonts, metadata, skip link, CartProvider, header/footer
    page.tsx                     landing page
    globals.css                  Tailwind v4 theme tokens + base styles
    catalog/  cart/  checkout/  checkout/success/
    products/[slug]/  login/  register/
    admin/  admin/products/new/  admin/products/[id]/edit/
    api/auth/{register,login,logout}/   api/orders/   api/admin/products/[id]/
  components/
    home/       Hero, PromoBanners, CategoryStrip, FeaturedProducts, ValueProps
    catalog/    FilterPanel, ActiveFilters, SortSelect
    product/    ProductCard, ProductPurchase
    cart/       CartView
    checkout/   CheckoutForm
    admin/      ProductForm, DeleteProductButton
    auth/       AuthForm
    layout/     SiteHeader, AccountNav, CartCount, SignOutButton, SiteFooter, NewsletterForm
    ui/         icons
  lib/
    prisma.ts                    PrismaClient singleton + libsql driver adapter
    products.ts  orders.ts  admin.ts      data-access layer (pages never call Prisma directly)
    cart.tsx                     cart store (useSyncExternalStore + localStorage)
    auth.ts                      JWT session: create / read / destroy / requireUser / requireAdmin
    validators.ts  validators-admin.ts    zod schemas for every API payload
    catalog-params.ts            URL ⇄ filter-state parsing
    pricing.ts  format.ts        shipping rules, cents → currency
prisma.config.ts                 Prisma 7 CLI config (datasource URL, seed command)
```

## 5. How it works

- **Money is integer cents** (`price`, `subtotal`, `total`) — no float rounding on totals.
- **Checkout never trusts the client**: `/api/orders` re-reads every price from the database,
  validates stock, then writes the order and decrements stock inside one transaction.
- **Cart state** lives in a module-level store read through `useSyncExternalStore`, mirrored to
  `localStorage`. The server render and the first client render both use the empty snapshot, so
  hydration always matches.
- **Filters are the URL** (`?category=men&size=M&min=40&max=120&sale=1`), so filtered views are
  shareable and crawlable. The filter form is plain HTML (`method="get"`) and works without JS.
- **Sessions** are HS256 JWTs in an `httpOnly` cookie. `requireAdmin()` redirects pages;
  `getAdminSession()` returns `null` so API routes can answer `401` JSON.
- **Deleting a product that appears on an order** returns `409` instead of breaking history —
  order lines keep a denormalised snapshot of name and unit price.
- **SQLite has no enums or scalar lists**, so `role`/`status` are strings and sizes/colours are
  relation tables (`_ProductToSize`, `_ColorToProduct`).
- **Prisma 7 requires a driver adapter**: `new PrismaClient({ adapter: new PrismaLibSql({ url }) })`.
  Connection URLs live in `prisma.config.ts` (CLI) and the adapter (runtime) — Prisma 7 rejects a
  `url` inside `schema.prisma`.

### Offline / restricted networks

`prisma generate` and `prisma migrate` download the schema-engine binary from
`binaries.prisma.sh`. If that host is unreachable, use `npm run db:setup:offline`, which applies
the committed `prisma/migrations/0001_init/migration.sql` through `node:sqlite` and then seeds —
same DDL, same resulting database. The **runtime** query compiler ships inside `@prisma/client` as
WASM, so the app itself never needs that host. `src/generated/prisma` is committed for the same
reason; regenerate it with `npm run db:generate` after schema changes.
