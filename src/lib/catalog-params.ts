import type { CatalogFilters, SortKey } from './products'

/**
 * Catalogue filter state lives entirely in the URL (?category=men&size=M&color=navy&min=20&max=80)
 * so filtered views are shareable, bookmarkable and crawlable.
 * Prices are dollars in the URL and cents in the database.
 */

const SORT_KEYS: SortKey[] = ['featured', 'newest', 'price-asc', 'price-desc', 'rating']

export type SearchParams = Record<string, string | string[] | undefined>

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return []
  const flat = Array.isArray(value) ? value : [value]
  return flat.flatMap((v) => v.split(',')).filter(Boolean)
}

function toCents(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return undefined
  const dollars = Number.parseFloat(raw)
  if (!Number.isFinite(dollars)) return undefined
  return Math.round(dollars * 100)
}

export function parseCatalogFilters(params: SearchParams): CatalogFilters {
  const category = toArray(params.category)[0]
  const sortRaw = toArray(params.sort)[0] as SortKey | undefined

  return {
    category: category || undefined,
    sizes: toArray(params.size),
    colors: toArray(params.color),
    minPrice: toCents(params.min),
    maxPrice: toCents(params.max),
    sale: toArray(params.sale)[0] === '1',
    sort: sortRaw && SORT_KEYS.includes(sortRaw) ? sortRaw : 'featured',
  }
}

export function countActiveFilters(filters: CatalogFilters): number {
  return (
    (filters.category ? 1 : 0) +
    filters.sizes.length +
    filters.colors.length +
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0) +
    (filters.sale ? 1 : 0)
  )
}
