import { Suspense } from 'react'
import { getFilterOptions, getProducts } from '@/lib/products'
import { countActiveFilters, parseCatalogFilters, type SearchParams } from '@/lib/catalog-params'
import { ProductCard } from '@/components/product/ProductCard'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'
import { SortSelect } from '@/components/catalog/SortSelect'

// Filters come from the URL and stock changes from the admin dashboard.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Catalogue',
  description: 'Browse the full ATELIER collection with filters for category, size, colour and price.',
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const filters = parseCatalogFilters(params)

  const [{ products, total }, options] = await Promise.all([
    getProducts(filters),
    getFilterOptions(),
  ])

  const activeCount = countActiveFilters(filters)
  const categoryLabel = filters.category
    ? (options.categories.find((c) => c.slug === filters.category)?.name ?? 'Catalogue')
    : 'All products'

  return (
    <div className="container-x px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-line pb-6">
        <p className="eyebrow text-clay">Collection</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{categoryLabel}</h1>
        <p className="mt-2 text-sm text-stone">
          {total} {total === 1 ? 'product' : 'products'}
          {activeCount > 0 ? ` · ${activeCount} filter${activeCount === 1 ? '' : 's'} active` : ''}
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[16rem_1fr]">
        <aside>
          {/* Collapsible on small screens, always visible from lg up */}
          <details open className="group lg:contents">
            <summary className="flex cursor-pointer items-center justify-between border border-line px-4 py-3 text-sm lg:hidden">
              Filters {activeCount > 0 ? `(${activeCount})` : ''}
              <span className="text-stone group-open:rotate-180 transition-transform">⌄</span>
            </summary>
            <div className="mt-6 lg:mt-0 lg:sticky lg:top-32">
              <FilterPanel options={options} filters={filters} />
            </div>
          </details>
        </aside>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <ActiveFilters
              filters={filters}
              labels={{
                categories: Object.fromEntries(options.categories.map((c) => [c.slug, c.name])),
                colors: Object.fromEntries(options.colors.map((c) => [c.slug, c.name])),
              }}
            />
            <Suspense fallback={null}>
              <SortSelect value={filters.sort ?? 'featured'} />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <div className="mt-16 border border-dashed border-line px-6 py-20 text-center">
              <h2 className="text-lg font-medium">No products match those filters</h2>
              <p className="mt-2 text-sm text-stone">
                Try widening the price range or removing a size.
              </p>
              <a
                href="/catalog"
                className="mt-6 inline-flex border border-ink/25 px-6 py-3 text-xs tracking-[0.16em] uppercase transition-colors hover:border-ink hover:bg-ink hover:text-bone"
              >
                Clear all filters
              </a>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
