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
