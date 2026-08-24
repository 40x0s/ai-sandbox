import Image from 'next/image'
import Link from 'next/link'
import { getProductsByIds } from '@/lib/products'
import { discountPercent, formatPrice } from '@/lib/format'
import { StarIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Compare products',
  description: 'Compare ATELIER pieces side by side.',
}

type Row = { label: string; render: (product: NonNullable<Awaited<ReturnType<typeof getProductsByIds>>[number]>) => React.ReactNode }

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[] }>
}) {
  const raw = await searchParams
  const idsParam = Array.isArray(raw.ids) ? raw.ids[0] : raw.ids
  const ids = (idsParam ?? '')
    .split(',')
    .filter(Boolean)
    .slice(0, 4)

  const found = await getProductsByIds(ids)
  // Preserve the order the user picked them in.
  const products = ids
    .map((id) => found.find((product) => product.id === id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))

  if (products.length === 0) {
    return (
      <div className="container-x px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="eyebrow text-clay">Compare</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Nothing selected yet</h1>
        <p className="mx-auto mt-3 max-w-sm text-stone">
          Use the “Compare” pill on any product card to add up to four pieces.
        </p>
        <Link
          href="/catalog"
          className="mt-8 inline-flex bg-ink px-8 py-3.5 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay"
        >
          Browse the collection
        </Link>
      </div>
    )
  }

  const rows: Row[] = [
    { label: 'Category', render: (p) => p.category.name },
    {
      label: 'Price',
      render: (p) => (
        <span className="flex items-baseline gap-2">
          <span className="font-medium tabular-nums">{formatPrice(p.price)}</span>
          {p.compareAtPrice && (
            <span className="text-xs text-stone line-through">{formatPrice(p.compareAtPrice)}</span>
          )}
        </span>
      ),
    },
    {
      label: 'Discount',
      render: (p) => {
        const discount = discountPercent(p.price, p.compareAtPrice)
        return discount ? <span className="text-clay">−{discount}%</span> : <span className="text-stone">—</span>
      },
    },
    {
      label: 'Rating',
      render: (p) =>
        p._count.reviews > 0 ? (
          <span className="flex items-center gap-1.5">
            <StarIcon className="h-4 w-4 text-clay" />
            <span className="tabular-nums">{p.rating.toFixed(1)}</span>
            <span className="text-xs text-stone">({p._count.reviews})</span>
          </span>
        ) : (
          <span className="text-stone">No reviews</span>
        ),
    },
    {
      label: 'Availability',
      render: (p) =>
        p.stock <= 0 ? (
          <span className="text-clay">Sold out</span>
        ) : p.stock <= 10 ? (
          <span>Only {p.stock} left</span>
        ) : (
          <span>In stock ({p.stock})</span>
        ),
    },
    {
      label: 'Sizes',
      render: (p) => p.sizes.map((size) => size.label).join(' · ') || 'One size',
    },
    {
      label: 'Colours',
      render: (p) => (
        <span className="flex flex-wrap items-center gap-1.5">
          {p.colors.map((color) => (
            <span key={color.id} className="flex items-center gap-1 text-xs">
              <span
                className="h-3 w-3 rounded-full ring-1 ring-ink/15"
                style={{ backgroundColor: color.hex }}
              />
              {color.name}
            </span>
          ))}
        </span>
      ),
    },
    { label: 'Description', render: (p) => <span className="text-stone">{p.description}</span> },
  ]

  return (
    <div className="container-x px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-line pb-6">
        <p className="eyebrow text-clay">Compare</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {products.length} {products.length === 1 ? 'product' : 'products'} side by side
        </h1>
      </header>

      <div className="mt-8 overflow-x-auto border border-line">
        <table className="w-full min-w-3xl text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bone-100/60">
              <th className="w-40 px-4 py-3 text-xs font-medium tracking-[0.12em] text-stone uppercase">
                Product
              </th>
              {products.map((product) => (
                <th key={product.id} className="px-4 py-4 align-top">
                  <Link href={`/products/${product.slug}`} className="group block w-32">
                    <span className="block aspect-4/5 overflow-hidden bg-bone-100">
                      <Image
                        src={product.images[0]?.url ?? product.imageUrl}
                        alt={product.name}
                        width={256}
                        height={320}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </span>
                    <span className="mt-2 block text-sm leading-snug font-medium group-hover:text-clay">
                      {product.name}
                    </span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.label}>
                <th className="px-4 py-4 text-xs font-medium tracking-[0.12em] text-stone uppercase align-top">
                  {row.label}
                </th>
                {products.map((product) => (
                  <td key={product.id} className="px-4 py-4 align-top">
                    {row.render(product)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="px-4 py-4" />
              {products.map((product) => (
                <td key={product.id} className="px-4 py-4">
                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-block bg-ink px-4 py-2.5 text-[11px] tracking-[0.14em] text-bone uppercase transition-colors hover:bg-clay"
                  >
                    View
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-stone">
        <Link href="/catalog" className="underline hover:text-ink">
          Back to the catalogue
        </Link>{' '}
        to change your selection.
      </p>
    </div>
  )
}
