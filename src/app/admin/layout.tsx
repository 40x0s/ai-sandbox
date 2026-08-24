import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { hasDefaultAdminPassword } from '@/lib/admin'

export const metadata = { title: 'Admin' }
export const dynamic = 'force-dynamic'

/** Everything under /admin is behind the admin guard. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()
  const defaultPassword = await hasDefaultAdminPassword()

  return (
    <div className="container-x px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow text-clay">Private area</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin dashboard</h1>
          <p className="mt-1 text-sm text-stone">Signed in as {session.email}</p>
        </div>
        <nav className="flex flex-wrap gap-3 text-xs tracking-[0.14em] uppercase">
          <Link href="/admin" className="border border-line px-4 py-2.5 transition-colors hover:border-ink">
            Products
          </Link>
          <Link
            href="/admin/orders"
            className="border border-line px-4 py-2.5 transition-colors hover:border-ink"
          >
            Orders
          </Link>
          <Link
            href="/admin/products/new"
            className="bg-ink px-4 py-2.5 text-bone transition-colors hover:bg-clay"
          >
            + New product
          </Link>
          <Link href="/" className="border border-line px-4 py-2.5 transition-colors hover:border-ink">
            View store
          </Link>
        </nav>
      </header>

      {defaultPassword && (
        <div
          role="alert"
          className="mt-6 border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay"
        >
          <span className="font-medium">Security:</span> the admin account still uses the seeded
          password <code className="font-mono">admin123</code>. Change it before taking this
          deployment live.
        </div>
      )}

      <div className="mt-8">{children}</div>
    </div>
  )
}
