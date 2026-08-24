import { prisma } from './prisma'
import { getSession, type Session } from './auth'

/** Admin data access + API-level authorisation. */

export async function getAdminProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      colors: true,
      sizes: { orderBy: { sort: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAdminProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      colors: true,
      sizes: true,
      images: { orderBy: { position: 'asc' } },
    },
  })
}

export async function getTaxonomies() {
  const [categories, sizes, colors] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.size.findMany({ orderBy: { sort: 'asc' } }),
    prisma.color.findMany({ orderBy: { name: 'asc' } }),
  ])
  return { categories, sizes, colors }
}

export async function getAdminStats() {
  const [productCount, orderCount, revenue, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
  ])

  return {
    productCount,
    orderCount,
    revenue: revenue._sum.total ?? 0,
    lowStock,
  }
}

/**
 * API-route guard. Unlike `requireAdmin()` (which redirects a page), this
 * returns null so route handlers can answer with 401 JSON.
 */
export async function getAdminSession(): Promise<Session | null> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

/**
 * Validates the relation ids coming from the form so a bad reference becomes a
 * 422 with a readable message instead of an unhandled foreign-key error.
 */
export async function validateTaxonomyRefs(data: {
  categoryId: string
  sizeLabels: string[]
  colorSlugs: string[]
}): Promise<string | null> {
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
  if (!category) return 'Unknown category'

  if (data.sizeLabels.length > 0) {
    const found = await prisma.size.count({ where: { label: { in: data.sizeLabels } } })
    if (found !== data.sizeLabels.length) return 'Unknown size selected'
  }

  if (data.colorSlugs.length > 0) {
    const found = await prisma.color.count({ where: { slug: { in: data.colorSlugs } } })
    if (found !== data.colorSlugs.length) return 'Unknown colour selected'
  }

  return null
}

/** Rebuilds a product's gallery: main image at position 0, then the extras. */
export async function replaceGallery(productId: string, mainUrl: string, extraUrls: string[]) {
  const urls = [mainUrl, ...extraUrls.filter((url) => url.length > 0 && url !== mainUrl)]

  await prisma.productImage.deleteMany({ where: { productId } })
  await prisma.productImage.createMany({
    data: urls.map((url, position) => ({
      productId,
      url,
      alt: position === 0 ? '' : `View ${position + 1}`,
      position,
    })),
  })
}

export async function getAdminOrders(limit = 50) {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { items: true },
  })
}

export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })
}
