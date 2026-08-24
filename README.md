# ATELIER — a complete clothing storefront

Full-stack e-commerce app: **Next.js 16 (App Router) · Tailwind CSS v4 · Prisma 7 · SQLite**.

Everything in the feature list below is implemented and verified end-to-end
(`bash scripts/e2e.sh` → **37 passed, 0 failed**).

| Area | What's built |
| --- | --- |
| Landing page | Hero, promo banners, category strip, featured products, value props, scroll reveals |
| Catalogue | `/catalog` with category / size / colour / price / sale / keyword filters + 5 sort modes — **filters apply instantly** and stay in the URL — plus pagination |
| Product page | Multi-image **gallery** with thumbnails + zoom, size & colour selectors, stock state, quantity, related products, **reviews**, JSON-LD structured data |
| Reviews | Rating summary, distribution bars, seeded reviews, submit form (`POST /api/reviews`) that keeps the product average in sync |
| Cart | Slide-over mini cart drawer, live header badge, toasts, quantity controls, free-shipping progress bar, `localStorage` persistence |
| Quick add | Add to bag straight from a product card (size row appears in place) |
| Live search | Debounced header search (`GET /api/products/search`) with thumbnails and keyboard navigation |
| Favourites | Heart toggle on every product, persisted to `localStorage`, dropdown in the header |
| Compare | Compare pill on cards, floating tray (max 4), `/compare` spec table |
| Recently viewed | Per-visitor strip on product pages, persisted to `localStorage` |
| Coupons | `WELCOME10` / `ATELIER20`, validated server-side, usage limits, applied on checkout |
| Dark mode | Light/dark toggle, follows the OS preference, persisted, no flash on load |
| Checkout | `/checkout` → `POST /api/orders` (server-side re-pricing + stock checks) → `/checkout/success` |
| Orders | `/account/orders` for customers, `/admin/orders` for admins |
| Auth | Register / login with bcrypt hashes and a signed `jose` JWT session cookie |
| Admin | `/admin` product list + gallery editor, stats, create / edit / delete — behind an admin guard |
| SEO | `sitemap.xml`, `robots.txt`, per-product JSON-LD, custom 404 |

---

## 1. Running it after downloading the folder

`node_modules/` and `prisma/dev.db` are **not** in the repository, so a fresh copy needs four
commands. Requires **Node.js ≥ 20.9** (`node -v`).

```bash
cd <the-folder>
npm install                 # ~20s
cp .env.example .env        # DATABASE_URL + AUTH_SECRET
npm run db:setup            # creates prisma/dev.db, applies the migration, seeds 7 products
npm run dev                 # → http://localhost:3000
```

Sign in as `admin@store.test` / `admin123` to reach `/admin`.

Seeded coupons: `WELCOME10` (10%), `ATELIER20` (20%, 100 uses), `EXPIRED5` (inactive).

If `npm run db:setup` fails with an error mentioning **binaries.prisma.sh**, your network is
blocking Prisma's engine download — use the fallback instead (same SQL, same result):

```bash
npm run db:setup:offline
```

If your copy already contains `prisma/dev.db` (e.g. you copied the whole directory rather than
cloning), skip the database step and just run `npm install && npm run dev`.

Production build:

```bash
npm run build && npm start
```

> Note: if you ever delete or replace `prisma/dev.db`, **restart `npm run dev` first**. A running
> dev server keeps the old file handle and every write then fails with `SQLITE_READONLY`.

## 2. Setting the project up from scratch

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
| `bash scripts/e2e.sh` | End-to-end smoke test — 67 assertions against a running dev server |

## 3. Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@store.test` | `admin123` |
| Customer | `demo@store.test` | `demo123` |

The admin account is what unlocks `/admin`. Passwords are stored as bcrypt hashes.

## 4. Routes

**Storefront** — `/`, `/catalog`, `/products/[slug]`, `/compare`, `/cart`, `/checkout`,
`/checkout/success`, `/login`, `/register`, `/account/orders`, `sitemap.xml`, `robots.txt`

**Admin (guarded)** — `/admin`, `/admin/orders`, `/admin/products/new`, `/admin/products/[id]/edit`

**API** — `POST /api/auth/{register,login,logout}` · `POST /api/orders` · `POST /api/reviews` ·
`POST /api/coupons` · `GET /api/products/search` · `POST /api/admin/products` ·
`PATCH|DELETE /api/admin/products/[id]`

## 5. Folder structure

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
    catalog/    FilterControls (instant, URL-synced), CatalogSearch, ActiveFilters,
                SortSelect, Pagination
    product/    ProductCard, ProductGallery, ProductPurchase, QuickAdd, WishlistToggle,
                CompareToggle, ReviewSection, ReviewForm, RecentlyViewed
    cart/       CartView
    checkout/   CheckoutForm
    admin/      ProductForm (incl. gallery editor), DeleteProductButton
    auth/       AuthForm
    layout/     SiteHeader, AccountNav, BagButton, CartCount, CartDrawer, CompareTray,
                MobileMenu, SearchBox, ThemeToggle, WishlistMenu, SignOutButton,
                SiteFooter, NewsletterForm
    ui/         icons, Reveal
  lib/
    prisma.ts                    PrismaClient singleton + libsql driver adapter
    products.ts  orders.ts  admin.ts  coupons.ts   data-access layer (pages never
                 call Prisma directly)
    cart.tsx  wishlist.tsx  compare.tsx  recent.tsx  external stores
                 (useSyncExternalStore + localStorage)
    ui.tsx                       cart drawer state, toast stack, scroll lock
    auth.ts                      JWT session: create / read / destroy / requireUser / requireAdmin
    rate-limit.ts                fixed-window throttle for auth and reviews
    validators.ts  validators-admin.ts    zod schemas for every API payload
    catalog-params.ts            URL ⇄ filter-state parsing
    pricing.ts  format.ts        shipping rules, cents → currency
prisma.config.ts                 Prisma 7 CLI config (datasource URL, seed command)
```

## 6. How it works

- **Money is integer cents** (`price`, `subtotal`, `total`) — no float rounding on totals.
- **Checkout never trusts the client**: `/api/orders` re-reads every price from the database,
  validates stock, then writes the order and decrements stock inside one transaction with a
  conditional `WHERE stock >= quantity`, so concurrent checkouts cannot oversell.
- **Cart state** lives in a module-level store read through `useSyncExternalStore`, mirrored to
  `localStorage`. The server render and the first client render both use the empty snapshot, so
  hydration always matches.
- **Filters are the URL** (`?category=men&size=M&min=40&max=120&sale=1&q=linen`), so filtered views
  are shareable and crawlable. They apply instantly: each control rewrites the query string and the
  server re-renders the result set.
- **Sessions** are HS256 JWTs in an `httpOnly`, `Secure`, `SameSite=Lax` cookie (switched to
  `SameSite=None` only for cross-site embedding). `requireAdmin()` redirects pages;
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

## 7. Production readiness

**Verdict: a complete, working demo — not yet safe to take real orders on.**

### What is already production-grade

- TypeScript end-to-end (`tsc --noEmit` clean), ESLint clean, production build clean
- zod validation on every API payload; bcrypt password hashing
- **The client is never trusted on price**: `/api/orders` re-reads every price from the database
- Stock is decremented inside a transaction with a conditional `WHERE stock >= quantity`, so two
  concurrent orders cannot oversell (verified: one wins with 201, the other gets 409, stock ends at 0)
- Products referenced by orders cannot be deleted (409), preserving order history
- Session cookie is `HttpOnly; Secure; SameSite=Lax`, and the app **refuses to issue sessions in
  production with the placeholder `AUTH_SECRET`**
- Security headers: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS
- Brute-force throttle on login (8 / 5 min per email+IP) and register (5 / 10 min per IP)
- Pages never touch Prisma directly — swapping databases means editing `lib/prisma.ts` + the schema

### Blockers before going live

| # | Item | Why / what to do |
| --- | --- | --- |
| 1 | **SQLite file storage** | A file on disk does not survive serverless/ephemeral filesystems (Vercel, Lambda). Move to Postgres: change the datasource provider and use `@prisma/adapter-pg`, then `prisma migrate dev`. Or deploy on a VM/container with a persistent volume. |
| 2 | **`AUTH_SECRET`** | Must be your own 32+ character value (`openssl rand -base64 32`). Verified: with the placeholder the login route fails closed with HTTP 500. |
| 3 | **Admin password** | The seed creates `admin@store.test / admin123`. Change or remove it. |
| 4 | **Payments** | Checkout is a simulation — no provider is called. Integrate Stripe/Paymob/etc. before charging anyone. |
| 5 | **Email** | No order confirmation or password reset emails are sent. |
| 6 | **CSP strictness** | `X-Frame-Options: DENY` + `frame-ancestors 'none'` now ship by default (verified). The CSP still allows `'unsafe-inline'` for scripts/styles because Next emits inline bootstrap code — move to Next's nonce-based CSP before handling real customer data. |
| 7 | **Rate limiting scope** | In-memory and per instance. Use Redis or an edge limiter for multi-instance deployments. |
| 8 | **Automated tests** | `scripts/e2e.sh` (67 assertions) runs in CI (`.github/workflows/ci.yml`: lint → typecheck → db → build → e2e). Unit tests are still missing. |
| 9 | **`NEXT_PUBLIC_SITE_URL`** | Set it to the real domain, otherwise Open Graph image URLs point at localhost. |
| 10 | **Product images** | Served from `public/images`. Real catalogs need object storage + a CDN and an upload flow. |

### Deploying with Docker (SQLite on a persistent volume)

Works on any container host with real storage — Fly.io, Railway, Render, a VPS.
**Not** on serverless (ephemeral filesystem).

```bash
export AUTH_SECRET="$(openssl rand -base64 32)"
docker compose up --build          # http://localhost:3000
```

The image runs `db:setup:offline` on every start; applied migrations are recorded
in `_applied_migrations`, so restarts are safe. The SQLite file lives in the
`atelier-data` volume at `/app/data/atelier.db`.

Bare metal / VM instead:

```bash
npm ci
cp .env.example .env      # then set AUTH_SECRET and NEXT_PUBLIC_SITE_URL
npm run db:setup          # or db:setup:offline where binaries.prisma.sh is blocked
npm run build && npm start
```

Required environment: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`.
See `.env.production.example`.

### Payments

`src/lib/payments.ts` is the only place that touches payment. It is a simulation
today: with `PAYMENTS_MODE=live` it fails closed with HTTP 402 rather than
marking an unpaid order as paid. Implement the `live` branch (Stripe, Paymob,
Checkout.com…) and nothing else has to change — `Order.paymentReference` already
stores the provider reference.
