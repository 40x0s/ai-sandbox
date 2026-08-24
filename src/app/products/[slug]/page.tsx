import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/lib/products'
import { discountPercent, formatPrice } from '@/lib/format'
import { ProductPurchase } from '@/components/product/ProductPurchase'
import { ProductCard } from '@/components/product/ProductCard'
import { ReturnIcon, ShieldIcon, StarIcon, TruckIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product not found' }

  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: { images: [product.imageUrl] },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product, 4)
  const discount = discountPercent(product.price, product.compareAtPrice)

  return (
    <div className="container-x px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-stone">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-ink">
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-ink">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="group relative aspect-4/5 overflow-hidden bg-bone-100">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={1408}
              height={768}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {discount && (
              <span className="absolute top-4 left-4 bg-clay px-3 py-1.5 text-[11px] tracking-[0.14em] text-bone uppercase">
                −{discount}%
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="eyebrow text-clay">{product.category.name}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {product.name}
          </h1>

          {product.reviewCount > 0 && (
            <p className="mt-3 flex items-center gap-2 text-sm text-stone">
              <span className="flex items-center gap-1">
                <StarIcon className="h-4 w-4 text-clay" />
                <span className="font-medium text-ink">{product.rating.toFixed(1)}</span>
              </span>
              · {product.reviewCount} reviews
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-medium">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-stone line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
            {discount && <span className="text-sm text-clay">Save {discount}%</span>}
          </div>

          <p className="mt-6 leading-relaxed text-ink-soft">{product.description}</p>

          <ProductPurchase
            productId={product.id}
            slug={product.slug}
            name={product.name}
            imageUrl={product.imageUrl}
            price={product.price}
            stock={product.stock}
            sizes={product.sizes.map((size) => ({ label: size.label }))}
            colors={product.colors.map((color) => ({ label: color.name, hex: color.hex }))}
          />

          <dl className="mt-10 grid gap-4 border-t border-line pt-8 sm:grid-cols-3">
            {[
              { icon: TruckIcon, label: 'Free shipping over $75' },
              { icon: ReturnIcon, label: '30-day free returns' },
              { icon: ShieldIcon, label: 'Secure checkout' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-stone">
                <Icon className="h-5 w-5 shrink-0 text-clay" />
                {label}
              </div>
            ))}
          </dl>

          <dl className="mt-8 space-y-2 border-t border-line pt-8 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-stone">Available sizes</dt>
              <dd>{product.sizes.map((s) => s.label).join(' · ') || 'One size'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone">Colours</dt>
              <dd>{product.colors.map((c) => c.name).join(' · ') || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone">Reference</dt>
              <dd className="font-mono text-xs">{product.slug.toUpperCase()}</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-2xl font-semibold tracking-tight">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
