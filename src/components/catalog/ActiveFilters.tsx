import Link from 'next/link'
import type { CatalogFilters } from '@/lib/products'

type Props = {
  filters: CatalogFilters
  labels: { categories: Record<string, string>; colors: Record<string, string> }
}

/** Removable chips summarising the active URL filters. */
export function ActiveFilters({ filters, labels }: Props) {
  const chips: { label: string; href: string }[] = []

  const without = (key: string, value?: string) => {
    const params = new URLSearchParams()
    if (filters.category && key !== 'category') params.set('category', filters.category)
    if (filters.q && key !== 'q') params.set('q', filters.q)
    for (const size of filters.sizes) {
      if (key === 'size' && value === size) continue
      params.append('size', size)
    }
    for (const color of filters.colors) {
      if (key === 'color' && value === color) continue
      params.append('color', color)
    }
    if (filters.minPrice !== undefined && key !== 'min') params.set('min', String(filters.minPrice / 100))
    if (filters.maxPrice !== undefined && key !== 'max') params.set('max', String(filters.maxPrice / 100))
    if (filters.sale && key !== 'sale') params.set('sale', '1')
    if (filters.sort && filters.sort !== 'featured') params.set('sort', filters.sort)
    const query = params.toString()
    return query ? `/catalog?${query}` : '/catalog'
  }

  if (filters.q) {
    chips.push({ label: `“${filters.q}”`, href: without('q') })
  }
  if (filters.category) {
    chips.push({
      label: labels.categories[filters.category] ?? filters.category,
      href: without('category'),
    })
  }
  for (const size of filters.sizes) {
    chips.push({ label: `Size ${size}`, href: without('size', size) })
  }
  for (const color of filters.colors) {
    chips.push({ label: labels.colors[color] ?? color, href: without('color', color) })
  }
  if (filters.minPrice !== undefined) {
    chips.push({ label: `From $${filters.minPrice / 100}`, href: without('min') })
  }
  if (filters.maxPrice !== undefined) {
    chips.push({ label: `Up to $${filters.maxPrice / 100}`, href: without('max') })
  }
  if (filters.sale) {
    chips.push({ label: 'On sale', href: without('sale') })
  }

  if (chips.length === 0) return null

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={`${chip.label}-${chip.href}`}>
          <Link
            href={chip.href}
            className="inline-flex items-center gap-2 border border-line bg-bone-100/70 px-3 py-1.5 text-xs transition-colors hover:border-ink"
          >
            {chip.label}
            <span aria-hidden className="text-stone">
              ×
            </span>
          </Link>
        </li>
      ))}
      <li>
        <Link href="/catalog" className="px-2 py-1.5 text-xs text-stone underline hover:text-ink">
          Clear all
        </Link>
      </li>
    </ul>
  )
}
