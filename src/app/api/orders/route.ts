import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { checkoutSchema } from '@/lib/validators'
import { shippingFor } from '@/lib/pricing'

/**
 * Checkout simulation: validates the bag against the database, re-prices every
 * line from the stored product price (the client's numbers are never trusted),
 * then writes the order and decrements stock inside one transaction.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = checkoutSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid checkout details' },
      { status: 422 },
    )
  }

  const { lines, ...customer } = parsed.data

  const productIds = [...new Set(lines.map((line) => line.productId))]
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
  const productById = new Map(products.map((product) => [product.id, product]))

  for (const line of lines) {
    const product = productById.get(line.productId)
    if (!product) {
      return NextResponse.json(
        { error: 'An item in your bag is no longer available. Please refresh your bag.' },
        { status: 422 },
      )
    }
    if (product.stock < line.quantity) {
      return NextResponse.json(
        {
          error: `${product.name} only has ${product.stock} left — reduce the quantity and try again.`,
        },
        { status: 409 },
      )
    }
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + (productById.get(line.productId)?.price ?? 0) * line.quantity,
    0,
  )
  const shipping = shippingFor(subtotal)
  const total = subtotal + shipping

  const session = await getSession()

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        ...customer,
        userId: session?.userId ?? null,
        subtotal,
        shipping,
        total,
        // Simulated payment: the order is considered paid immediately.
        status: 'PAID',
        items: {
          create: lines.map((line) => {
            const product = productById.get(line.productId)!
            return {
              productId: product.id,
              name: product.name,
              unitPrice: product.price,
              quantity: line.quantity,
              size: line.size,
              color: line.color,
            }
          }),
        },
      },
    })

    for (const line of lines) {
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
      })
    }

    return created
  })

  return NextResponse.json({ ok: true, orderId: order.id, total }, { status: 201 })
}
