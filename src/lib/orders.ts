import { prisma } from './prisma'

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    // OrderItem has no timestamp of its own — insertion order is preserved by id.
    include: { items: true },
  })
}

export type OrderWithItems = NonNullable<Awaited<ReturnType<typeof getOrderById>>>

export async function getRecentOrders(limit = 10) {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { _count: { select: { items: true } } },
  })
}
