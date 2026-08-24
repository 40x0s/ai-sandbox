'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

/**
 * Filters apply the moment you touch them: each control rewrites the URL and
 * the server re-renders the result set. Nothing is kept in local state except
 * the two price boxes, which apply on Enter / blur / preset.
 */

type Options = {
  categories: { slug: string; name: string; productCount: number }[]
  sizes: { id: string; label: string }[]
  colors: { id: string; name: string; slug: string; hex: string }[]
  priceRange: { min: number; max: number }
}

type Active = {
  category?: string
  q?: string
  sizes: string[]
  colors: string[]
  minPrice?: number
  maxPrice?: number
  sale?: boolean
}

function useUrlFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const push = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    const query = params.toString()
    startTransition(() => router.push(query ? `${pathname}?${query}` : pathname))
  }

  return { push, isPending }
}

export function FilterControls({ options, active }: { options: Options; active: Active }) {
  const { push, isPending } = useUrlFilters()
  const [minInput, setMinInput] = useState(
    active.minPrice !== undefined ? String(active.minPrice / 100) : '',
  )
  const [maxInput, setMaxInput] = useState(
    active.maxPrice !== undefined ? String(active.maxPrice / 100) : '',
  )

  const applyPrice = () => {
    push((params) => {
      const min = Number.parseFloat(minInput)
      const max = Number.parseFloat(maxInput)
      if (Number.isFinite(min)) params.set('min', String(min))
      else params.delete('min')
      if (Number.isFinite(max)) params.set('max', String(max))
      else params.delete('max')
    })
  }

  const toggleMany = (key: string, value: string, current: string[]) => {
    push((params) => {
      params.delete(key)
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      for (const item of next) params.append(key, item)
    })
  }

  const presets = [
    { label: 'Under $50', min: '', max: '50' },
    { label: '$50 – $100', min: '50', max: '100' },
    { label: '$100 – $150', min: '100', max: '150' },
    { label: '$150 +', min: '150', max: '' },
  ]

  return (
    <div className={`space-y-9 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      {/* Category */}
      <fieldset>
        <legend className="eyebrow text-stone">Category</legend>
        <div className="mt-4 space-y-2.5">
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="radio"
              name="category"
              checked={!active.category}
              onChange={() => push((params) => params.delete('category'))}
              className="h-4 w-4 accent-[var(--color-clay)]"
            />
            All categories
          </label>
          {options.categories.map((category) => (
            <label key={category.slug} className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="radio"
                name="category"
                checked={active.category === category.slug}
                onChange={() => push((params) => params.set('category', category.slug))}
                className="h-4 w-4 accent-[var(--color-clay)]"
              />
              {category.name}
              <span className="text-xs text-stone">({category.productCount})</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Size */}
      <fieldset>
        <legend className="eyebrow text-stone">Size</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {options.sizes.map((size) => {
            const on = active.sizes.includes(size.label)
            return (
              <button
                key={size.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleMany('size', size.label, active.sizes)}
                className={`border px-3 py-1.5 text-sm transition-all ${
                  on
                    ? 'border-ink bg-ink text-bone'
                    : 'border-line hover:border-ink/40 hover:-translate-y-px'
                }`}
              >
                {size.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Colour */}
      <fieldset>
        <legend className="eyebrow text-stone">Colour</legend>
        <div className="mt-4 space-y-2.5">
          {options.colors.map((color) => (
            <label key={color.id} className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={active.colors.includes(color.slug)}
                onChange={() => toggleMany('color', color.slug, active.colors)}
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

      {/* Price */}
      <fieldset>
        <legend className="eyebrow text-stone">Price (USD)</legend>

        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((preset) => {
            const on =
              (preset.min === '' || Number(preset.min) * 100 === active.minPrice) &&
              (preset.max === '' || Number(preset.max) * 100 === active.maxPrice)
            return (
              <button
                key={preset.label}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setMinInput(preset.min)
                  setMaxInput(preset.max)
                  push((params) => {
                    if (preset.min) params.set('min', preset.min)
                    else params.delete('min')
                    if (preset.max) params.set('max', preset.max)
                    else params.delete('max')
                  })
                }}
                className={`border px-3 py-1.5 text-xs transition-colors ${
                  on ? 'border-ink bg-ink text-bone' : 'border-line hover:border-ink/40'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            applyPrice()
          }}
          className="mt-4 flex items-center gap-2"
        >
          <label htmlFor="filter-min" className="sr-only">
            Minimum price
          </label>
          <input
            id="filter-min"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            placeholder={String(Math.floor(options.priceRange.min / 100))}
            value={minInput}
            onChange={(event) => setMinInput(event.target.value)}
            onBlur={applyPrice}
            className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
          <span className="text-stone">—</span>
          <label htmlFor="filter-max" className="sr-only">
            Maximum price
          </label>
          <input
            id="filter-max"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            placeholder={String(Math.ceil(options.priceRange.max / 100))}
            value={maxInput}
            onChange={(event) => setMaxInput(event.target.value)}
            onBlur={applyPrice}
            className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 border border-line px-3 py-2 text-xs tracking-[0.12em] uppercase transition-colors hover:border-ink hover:bg-ink hover:text-bone"
          >
            Go
          </button>
        </form>
      </fieldset>

      {/* Sale */}
      <label className="flex cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={active.sale}
          onChange={() =>
            push((params) => {
              if (active.sale) params.delete('sale')
              else params.set('sale', '1')
            })
          }
          className="h-4 w-4 accent-[var(--color-clay)]"
        />
        On sale only
      </label>

      <a
        href="/catalog"
        className="block border border-line px-5 py-3 text-center text-xs tracking-[0.16em] uppercase transition-colors hover:border-ink"
      >
        Clear all filters
      </a>
    </div>
  )
}

/** Keyword box on the catalogue toolbar, synced to ?q= */
export function CatalogSearch({ value }: { value: string }) {
  const { push, isPending } = useUrlFilters()
  const [term, setTerm] = useState(value)

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        const trimmed = term.trim()
        push((params) => {
          if (trimmed) params.set('q', trimmed)
          else params.delete('q')
        })
      }}
      className="relative flex items-center"
    >
      <label htmlFor="catalog-q" className="sr-only">
        Search within results
      </label>
      <input
        id="catalog-q"
        type="search"
        value={term}
        placeholder="Search within results…"
        onChange={(event) => setTerm(event.target.value)}
        onBlur={() => {
          const trimmed = term.trim()
          const current = value ?? ''
          if (trimmed !== current) {
            push((params) => {
              if (trimmed) params.set('q', trimmed)
              else params.delete('q')
            })
          }
        }}
        className={`w-56 border border-line bg-transparent py-2 pr-3 pl-3 text-sm transition-opacity focus:border-ink focus:outline-none ${
          isPending ? 'opacity-60' : ''
        }`}
      />
    </form>
  )
}
