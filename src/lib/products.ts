import { prisma } from './prisma'
import type { Prisma } from '../generated/prisma/client'

/**
 * Data-access layer for the storefront. Pages and components never call Prisma
 * directly — they go through these functions, which keeps query shapes and the
 * selects each screen needs in one place.
 */

export const productCardInclude = {
  category: true,
  colors: true,
  sizes: { orderBy: { sort: 'asc' as const } },
} satisfies Prisma.ProductInclude

export type ProductCardData = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>

export type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'

export type CatalogFilters = {
  category?: string
  /** Free-text search across name, description and category. */
  q?: string
  /** Always present (possibly empty) so callers can index without null checks. */
  sizes: string[]
  colors: string[]
  minPrice?: number // cents
  maxPrice?: number // cents
  sale?: boolean
  sort?: SortKey
}

const orderByForSort: Record<SortKey, Prisma.ProductOrderByWithRelationInput[]> = {
  featured: [{ featured: 'desc' }, { rating: 'desc' }],
  newest: [{ createdAt: 'desc' }],
  'price-asc': [{ price: 'asc' }],
  'price-desc': [{ price: 'desc' }],
  rating: [{ rating: 'desc' }],
}

export function buildProductWhere(filters: CatalogFilters): Prisma.ProductWhereInput {
  const { category, q, sizes = [], colors = [], minPrice, maxPrice, sale } = filters
  const term = q?.trim()

  return {
    ...(term
      ? {
          OR: [
            { name: { contains: term } },
            { description: { contains: term } },
            { category: { name: { contains: term } } },
          ],
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(sizes.length > 0 ? { sizes: { some: { label: { in: sizes } } } } : {}),
    ...(colors.length > 0 ? { colors: { some: { slug: { in: colors } } } } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { gte: minPrice, lte: maxPrice } }
      : {}),
    ...(sale ? { compareAtPrice: { not: null } } : {}),
  }
}

export const CATALOG_PAGE_SIZE = 9

export async function getProducts(
  filters: CatalogFilters,
  options?: { page?: number; pageSize?: number },
) {
  const where = buildProductWhere(filters)
  const pageSize = options?.pageSize ?? CATALOG_PAGE_SIZE
  const page = Math.max(1, options?.page ?? 1)

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy: orderByForSort[filters.sort ?? 'featured'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getFilterOptions() {
  const [categories, sizes, colors, aggregate] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { products: true } } } }),
    prisma.size.findMany({ orderBy: { sort: 'asc' } }),
    prisma.color.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.aggregate({ _min: { price: true }, _max: { price: true } }),
  ])

  return {
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, productCount: c._count.products })),
    sizes,
    colors,
    priceRange: { min: aggregate._min.price ?? 0, max: aggregate._max.price ?? 0 },
  }
}

export async function getFeaturedProducts(limit = 4): Promise<ProductCardData[]> {
  return prisma.product.findMany({
    where: { featured: true },
    include: productCardInclude,
    orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  })
}

export async function getCategoriesWithCounts() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    productCount: category._count.products,
  }))
}

/** Lightweight shape for the live-search dropdown. */
export async function searchProducts(term: string, take = 6) {
  const rows = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: term } },
        { description: { contains: term } },
        { category: { name: { contains: term } } },
      ],
    },
    include: { category: true },
    orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
    take,
  })

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    imageUrl: row.imageUrl,
    categoryName: row.category.name,
  }))
}

export const productDetailInclude = {
  category: true,
  colors: true,
  sizes: { orderBy: { sort: 'asc' as const } },
  images: { orderBy: { position: 'asc' as const } },
  reviews: { orderBy: { createdAt: 'desc' as const } },
} satisfies Prisma.ProductInclude

export type ProductDetailData = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>

export async function getProductBySlug(slug: string): Promise<ProductDetailData | null> {
  return prisma.product.findUnique({ where: { slug }, include: productDetailInclude })
}

export async function getRelatedProducts(
  product: { id: string; categoryId: string },
  limit = 4,
): Promise<ProductCardData[]> {
  return prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    include: productCardInclude,
    orderBy: { rating: 'desc' },
    take: limit,
  })
}

/** Full comparison rows for /compare?ids=a,b,c */
export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return []

  return prisma.product.findMany({
    where: { id: { in: ids } },
    include: {
      category: true,
      colors: true,
      sizes: { orderBy: { sort: 'asc' } },
      images: { orderBy: { position: 'asc' } },
      _count: { select: { reviews: true } },
    },
  })
}

export type ComparisonProduct = Awaited<ReturnType<typeof getProductsByIds>>[number]

export async function getAllProductSlugs() {
  return prisma.product.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })
}
