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
  const { category, sizes = [], colors = [], minPrice, maxPrice, sale } = filters

  return {
    ...(category ? { category: { slug: category } } : {}),
    ...(sizes.length > 0 ? { sizes: { some: { label: { in: sizes } } } } : {}),
    ...(colors.length > 0 ? { colors: { some: { slug: { in: colors } } } } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { gte: minPrice, lte: maxPrice } }
      : {}),
    ...(sale ? { compareAtPrice: { not: null } } : {}),
  }
}

export async function getProducts(
  filters: CatalogFilters,
): Promise<{ products: ProductCardData[]; total: number }> {
  const where = buildProductWhere(filters)

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy: orderByForSort[filters.sort ?? 'featured'],
    }),
    prisma.product.count({ where }),
  ])

  return { products, total }
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

export const productDetailInclude = {
  category: true,
  colors: true,
  sizes: { orderBy: { sort: 'asc' as const } },
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
