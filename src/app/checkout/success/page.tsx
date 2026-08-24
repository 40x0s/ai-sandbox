import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderById } from '@/lib/orders'
import { formatPrice } from '@/lib/format'

export const metadata = { title: 'Order confirmed' }
export const dynamic = 'force-dynamic'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>
}) {
  const raw = await searchParams
  const id = Array.isArray(raw.id) ? raw.id[0] : raw.id
  if (!id) notFound()

  const order = await getOrderById(id)
  if (!order) notFound()

  return (
    <div className="container-x px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow text-sage">Payment simulated</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Thank you, {order.fullName.split(' ')[0]}
        </h1>
        <p className="mt-3 text-stone">
          Your order is confirmed and saved to the database. A receipt would normally be emailed to{' '}
          <span className="text-ink">{order.email}</span>.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-4 border border-line bg-white/60 p-6 text-sm sm:grid-cols-4">
          <div>
            <dt className="eyebrow text-stone">Order</dt>
            <dd className="mt-1 font-mono text-xs">{order.id.slice(-8).toUpperCase()}</dd>
          </div>
          <div>
            <dt className="eyebrow text-stone">Status</dt>
            <dd className="mt-1">{order.status}</dd>
          </div>
          <div>
            <dt className="eyebrow text-stone">Total</dt>
            <dd className="mt-1 tabular-nums">{formatPrice(order.total)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-stone">Shipping</dt>
            <dd className="mt-1">{formatPrice(order.shipping) === '$0.00' ? 'Free' : formatPrice(order.shipping)}</dd>
          </div>
        </dl>

        <h2 className="mt-10 text-sm font-medium tracking-[0.14em] uppercase">Items</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-4 text-sm">
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

        <p className="mt-6 text-sm text-stone">
          Delivering to {order.address}, {order.city} {order.postcode}, {order.country}
        </p>

        <Link
          href="/catalog"
          className="mt-10 inline-flex bg-ink px-8 py-3.5 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
