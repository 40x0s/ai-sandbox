import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { checkoutSchema } from '@/lib/validators'
import { shippingFor } from '@/lib/pricing'
import { validateCoupon } from '@/lib/coupons'

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

  const { lines, couponCode, ...customer } = parsed.data

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
  // Coupons are re-validated here — the client's discount is never trusted.
  let discount = 0
  let appliedCoupon: string | null = null
  if (couponCode) {
    const check = await validateCoupon(couponCode, subtotal)
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 422 })
    }
    discount = check.discount
    appliedCoupon = check.code
  }

  const shipping = shippingFor(subtotal)
  const total = subtotal - discount + shipping

  const session = await getSession()

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          ...customer,
          userId: session?.userId ?? null,
          subtotal,
          discount,
          couponCode: appliedCoupon,
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

      if (appliedCoupon) {
        await tx.coupon.update({
          where: { code: appliedCoupon },
          data: { usedCount: { increment: 1 } },
        })
      }

      for (const line of lines) {
        // Conditional decrement: `stock >= quantity` is part of the WHERE, so if a
        // concurrent request took the last units between our check and this write,
        // zero rows update and the whole transaction rolls back instead of
        // overselling into negative stock.
        const updated = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        })

        if (updated.count === 0) {
          throw new StockConflict(
            `${productById.get(line.productId)?.name ?? 'An item'} just sold out — please review your bag.`,
          )
        }
      }

      return created
    })

    return NextResponse.json(
      { ok: true, orderId: order.id, total, discount, couponCode: appliedCoupon },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof StockConflict) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    throw error
  }
}

class StockConflict extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StockConflict'
  }
}
