import Image from 'next/image'
import Link from 'next/link'
import type { ProductCardData } from '@/lib/products'
import { discountPercent, formatPrice } from '@/lib/format'
import { StarIcon } from '@/components/ui/icons'
import { QuickAdd } from './QuickAdd'
import { WishlistToggle } from './WishlistToggle'
import { CompareToggle } from './CompareToggle'

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount = discountPercent(product.price, product.compareAtPrice)
  const soldOut = product.stock <= 0

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-4/5 overflow-hidden bg-bone-100">
        <Link href={`/products/${product.slug}`} aria-label={product.name} className="block h-full w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={1408}
            height={768}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        </Link>

        {discount && !soldOut && (
          <span className="absolute top-3 left-3 bg-clay px-2.5 py-1 text-[10px] tracking-[0.14em] text-bone uppercase">
            −{discount}%
          </span>
        )}
        {soldOut && (
          <span className="absolute top-3 left-3 bg-ink px-2.5 py-1 text-[10px] tracking-[0.14em] text-bone uppercase">
            Sold out
          </span>
        )}

        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
          <WishlistToggle
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.imageUrl,
              price: product.price,
            }}
          />
          <CompareToggle
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.imageUrl,
            }}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 ease-out group-focus-within:translate-y-0 group-hover:translate-y-0 md:translate-y-full">
          <QuickAdd
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.imageUrl,
              price: product.price,
              stock: product.stock,
            }}
            sizes={product.sizes}
            colors={product.colors}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="eyebrow text-stone">{product.category.name}</p>

        <h3 className="mt-1.5 text-sm leading-snug font-medium">
          <Link href={`/products/${product.slug}`} className="transition-colors hover:text-clay">
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className={product.compareAtPrice ? 'font-medium text-clay' : 'font-medium'}>
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-stone line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1" aria-hidden>
            {product.colors.map((color) => (
              <span
                key={color.id}
                title={color.name}
                className="h-3.5 w-3.5 rounded-full ring-1 ring-ink/15 ring-inset"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>

          {product.reviewCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-stone">
              <StarIcon className="h-3.5 w-3.5 text-clay" />
              {product.rating.toFixed(1)}
              <span className="sr-only">out of 5, {product.reviewCount} reviews</span>
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
