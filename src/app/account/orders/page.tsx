import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { getOrdersForUser } from '@/lib/admin'
import { formatPrice } from '@/lib/format'

export const metadata = { title: 'Your orders' }
export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const session = await requireUser()
  const orders = await getOrdersForUser(session.userId)

  return (
    <div className="container-x px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-line pb-6">
        <p className="eyebrow text-clay">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your orders</h1>
        <p className="mt-2 text-sm text-stone">Signed in as {session.email}</p>
      </header>

      {orders.length === 0 ? (
        <div className="mt-16 border border-dashed border-line px-6 py-20 text-center">
          <p className="text-sm text-stone">You have not placed an order yet.</p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex bg-ink px-8 py-3.5 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="border border-line">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bone-100/60 px-5 py-3">
                <div className="text-sm">
                  <span className="font-mono text-xs">{order.id.slice(-8).toUpperCase()}</span>
                  <span className="mx-2 text-stone">·</span>
                  <span className="text-stone">
                    {order.createdAt.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-[10px] tracking-[0.12em] uppercase bg-sage/15 text-sage">
                    {order.status}
                  </span>
                  <span className="text-sm font-medium tabular-nums">{formatPrice(order.total)}</span>
                </div>
              </div>

              <ul className="divide-y divide-line px-5">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="mt-0.5 text-xs text-stone">
                        {item.color} · Size {item.size} · ×{item.quantity}
                      </p>
                    </div>
                    <p className="tabular-nums">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </li>
                ))}
              </ul>

              {order.discount > 0 && (
                <p className="border-t border-line px-5 py-3 text-xs text-sage">
                  Coupon {order.couponCode} saved you {formatPrice(order.discount)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
