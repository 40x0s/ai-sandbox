import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/lib/products'
import { discountPercent, formatPrice } from '@/lib/format'
import { ProductPurchase } from '@/components/product/ProductPurchase'
import { ProductCard } from '@/components/product/ProductCard'
import { WishlistToggle } from '@/components/product/WishlistToggle'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ReviewSection } from '@/components/product/ReviewSection'
import { RecentlyViewed } from '@/components/product/RecentlyViewed'
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

  // Structured data so search engines can show price, stock and rating.
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : product.rating
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.slug,
    description: product.description,
    image: (product.images.length > 0 ? product.images.map((i) => i.url) : [product.imageUrl]).map(
      (url) => `${base}${url}`,
    ),
    brand: { '@type': 'Brand', name: 'ATELIER' },
    offers: {
      '@type': 'Offer',
      url: `${base}/products/${product.slug}`,
      priceCurrency: 'USD',
      price: (product.price / 100).toFixed(2),
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(product.reviews.length > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: averageRating.toFixed(1),
            reviewCount: product.reviews.length,
          },
        }
      : {}),
  }

  return (
    <div className="container-x px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <div className="relative">
            <ProductGallery
              name={product.name}
              images={
                product.images.length > 0
                  ? product.images.map((image) => ({
                      id: image.id,
                      url: image.url,
                      alt: image.alt || product.name,
                    }))
                  : [{ id: 'main', url: product.imageUrl, alt: product.name }]
              }
              badge={
                discount ? (
                  <span className="absolute top-4 left-4 bg-clay px-3 py-1.5 text-[11px] tracking-[0.14em] text-bone uppercase">
                    −{discount}%
                  </span>
                ) : undefined
              }
            />
            <div className="absolute top-3 right-3">
              <WishlistToggle
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  imageUrl: product.imageUrl,
                  price: product.price,
                }}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-stone">
            {product.images.length > 1 ? `${product.images.length} images · ` : ''}hover to zoom ·
            tap the heart to save
          </p>
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

      <ReviewSection
        productId={product.id}
        reviews={product.reviews}
        average={
          product.reviews.length > 0
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
              product.reviews.length
            : product.rating
        }
      />

      <RecentlyViewed
        id={product.id}
        slug={product.slug}
        name={product.name}
        imageUrl={product.imageUrl}
        price={product.price}
      />
    </div>
  )
}
