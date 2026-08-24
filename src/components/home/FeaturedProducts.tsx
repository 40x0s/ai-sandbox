import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import type { ProductCardData } from '@/lib/products'
import { ArrowRightIcon } from '@/components/ui/icons'

type Props = {
  products: ProductCardData[]
}

export function FeaturedProducts({ products }: Props) {
  return (
    <section className="container-x mt-20 px-4 sm:mt-28 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-clay">Hand-picked</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Featured products
          </h2>
        </div>
        <Link
          href="/catalog"
          className="group inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase transition-colors hover:text-clay"
        >
          All products
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
