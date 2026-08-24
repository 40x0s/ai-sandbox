import type { CatalogFilters } from '@/lib/products'

type Props = {
  options: {
    categories: { slug: string; name: string; productCount: number }[]
    sizes: { id: string; label: string }[]
    colors: { id: string; name: string; slug: string; hex: string }[]
    priceRange: { min: number; max: number }
  }
  filters: CatalogFilters
}

/**
 * Pure-HTML filter form (method="get") — works with JavaScript disabled and
 * keeps every filter in the URL. Unchecked boxes simply aren't submitted.
 */
export function FilterPanel({ options, filters }: Props) {
  return (
    <form method="get" action="/catalog" className="space-y-9">
      {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}

      <fieldset>
        <legend className="eyebrow text-stone">Category</legend>
        <div className="mt-4 space-y-2.5">
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="radio"
              name="category"
              value=""
              defaultChecked={!filters.category}
              className="h-4 w-4 accent-[var(--color-clay)]"
            />
            All categories
          </label>
          {options.categories.map((category) => (
            <label key={category.slug} className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="radio"
                name="category"
                value={category.slug}
                defaultChecked={filters.category === category.slug}
                className="h-4 w-4 accent-[var(--color-clay)]"
              />
              {category.name}
              <span className="text-xs text-stone">({category.productCount})</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow text-stone">Size</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {options.sizes.map((size) => (
            <label
              key={size.id}
              className="cursor-pointer border border-line px-3 py-1.5 text-sm transition-colors has-checked:border-ink has-checked:bg-ink has-checked:text-bone hover:border-ink/40"
            >
              <input
                type="checkbox"
                name="size"
                value={size.label}
                defaultChecked={filters.sizes.includes(size.label)}
                className="sr-only"
              />
              {size.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow text-stone">Colour</legend>
        <div className="mt-4 space-y-2.5">
          {options.colors.map((color) => (
            <label key={color.id} className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="color"
                value={color.slug}
                defaultChecked={filters.colors.includes(color.slug)}
                className="h-4 w-4 accent-[var(--color-clay)]"
              />
              <span
                className="h-3.5 w-3.5 rounded-full ring-1 ring-ink/15 ring-inset"
                style={{ backgroundColor: color.hex }}
              />
              {color.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow text-stone">Price (USD)</legend>
        <div className="mt-4 flex items-center gap-2">
          <label className="sr-only" htmlFor="min-price">
            Minimum price
          </label>
          <input
            id="min-price"
            type="number"
            name="min"
            min={0}
            step={1}
            placeholder={String(Math.floor(options.priceRange.min / 100))}
            defaultValue={filters.minPrice !== undefined ? filters.minPrice / 100 : ''}
            className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
          <span className="text-stone">—</span>
          <label className="sr-only" htmlFor="max-price">
            Maximum price
          </label>
          <input
            id="max-price"
            type="number"
            name="max"
            min={0}
            step={1}
            placeholder={String(Math.ceil(options.priceRange.max / 100))}
            defaultValue={filters.maxPrice !== undefined ? filters.maxPrice / 100 : ''}
            className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="sale"
          value="1"
          defaultChecked={filters.sale}
          className="h-4 w-4 accent-[var(--color-clay)]"
        />
        On sale only
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-ink px-5 py-3 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay"
        >
          Apply filters
        </button>
        <a
          href="/catalog"
          className="border border-line px-5 py-3 text-xs tracking-[0.16em] uppercase transition-colors hover:border-ink"
        >
          Clear
        </a>
      </div>
    </form>
  )
}
