import Link from 'next/link'
import { getAdminOrders } from '@/lib/admin'
import { formatPrice } from '@/lib/format'

export const metadata = { title: 'Orders' }
export const dynamic = 'force-dynamic'

const statusStyles: Record<string, string> = {
  PAID: 'bg-sage/15 text-sage',
  PENDING: 'bg-bone-100 text-stone',
  SHIPPED: 'bg-clay/15 text-clay',
  CANCELLED: 'bg-clay/15 text-clay',
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders(50)

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Orders <span className="text-stone">({orders.length})</span>
        </h2>
        <Link
          href="/admin"
          className="border border-line px-4 py-2 text-xs tracking-[0.14em] uppercase transition-colors hover:border-ink"
        >
          Products
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 border border-dashed border-line px-6 py-16 text-center text-sm text-stone">
          No orders yet. Place one from the storefront to see it here.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full min-w-4xl text-left text-sm">
            <thead className="border-b border-line bg-bone-100/70 text-xs tracking-[0.12em] text-stone uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Coupon</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-mono text-xs">
                    {order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-xs text-stone">
                    {order.createdAt.toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{order.fullName}</p>
                    <p className="text-xs text-stone">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {order.items.map((item) => `${item.name} ×${item.quantity}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {order.couponCode ? (
                      <span className="font-mono">
                        {order.couponCode} (−{formatPrice(order.discount)})
                      </span>
                    ) : (
                      <span className="text-stone">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-[10px] tracking-[0.12em] uppercase ${
                        statusStyles[order.status] ?? 'bg-bone-100 text-stone'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
