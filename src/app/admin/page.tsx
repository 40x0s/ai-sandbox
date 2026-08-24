import Image from 'next/image'
import Link from 'next/link'
import { getAdminProducts, getAdminStats } from '@/lib/admin'
import { formatPrice } from '@/lib/format'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const [products, stats] = await Promise.all([getAdminProducts(), getAdminStats()])

  const cards = [
    { label: 'Products', value: String(stats.productCount) },
    { label: 'Orders', value: String(stats.orderCount) },
    { label: 'Revenue', value: formatPrice(stats.revenue) },
    { label: 'Low stock (≤5)', value: String(stats.lowStock) },
  ]

  return (
    <>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="border border-line bg-bone-100/60 p-5">
            <dt className="eyebrow text-stone">{card.label}</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">{card.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 overflow-x-auto border border-line">
        <table className="w-full min-w-4xl text-left text-sm">
          <thead className="border-b border-line bg-bone-100/70 text-xs tracking-[0.12em] text-stone uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Options</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => (
              <tr key={product.id} className="align-middle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-12 shrink-0 overflow-hidden bg-bone-100">
                      <Image
                        src={product.imageUrl}
                        alt=""
                        width={120}
                        height={150}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/products/${product.slug}`}
                        className="font-medium hover:text-clay"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 font-mono text-[11px] text-stone">{product.slug}</p>
                      {product.featured && (
                        <span className="mt-1 inline-block bg-clay/10 px-2 py-0.5 text-[10px] tracking-[0.12em] text-clay uppercase">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{product.category.name}</td>
                <td className="px-4 py-3 tabular-nums">
                  {formatPrice(product.price)}
                  {product.compareAtPrice && (
                    <span className="ml-2 text-xs text-stone line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.stock <= 5
                        ? 'font-medium text-clay tabular-nums'
                        : 'tabular-nums'
                    }
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-stone">
                  {product.sizes.length} sizes · {product.colors.length} colours
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-xs underline hover:text-ink"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <p className="mt-8 text-sm text-stone">
          No products yet.{' '}
          <Link href="/admin/products/new" className="underline">
            Create the first one
          </Link>
          .
        </p>
      )}
    </>
  )
}
