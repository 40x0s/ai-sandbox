import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { checkoutSchema } from '@/lib/validators'
import { validateCoupon } from '@/lib/coupons'
import { shippingFor } from '@/lib/pricing'
import { applyDiscountToLines, paymentMode } from '@/lib/payments'
import { getStripe } from '@/lib/stripe'

/**
 * Creates a Stripe Checkout Session.
 *
 * Prices are re-read from the database here — the client never decides what it
 * pays. The order is written as PENDING first so the webhook has something to
 * confirm; stock is decremented when payment actually completes.
 */
export async function POST(request: Request) {
  if (paymentMode() !== 'stripe') {
    return NextResponse.json(
      {
        error:
          'Stripe is not configured on this deployment. Set STRIPE_SECRET_KEY, or use the simulated checkout.',
      },
      { status: 503 },
    )
  }

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
        { error: `${product.name} only has ${product.stock} left — reduce the quantity.` },
        { status: 409 },
      )
    }
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + (productById.get(line.productId)?.price ?? 0) * line.quantity,
    0,
  )

  let discount = 0
  let appliedCoupon: string | null = null
  if (couponCode) {
    const check = await validateCoupon(couponCode, subtotal)
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: 422 })
    discount = check.discount
    appliedCoupon = check.code
  }

  const shipping = shippingFor(subtotal)
  const total = subtotal - discount + shipping

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin
  const session = await getSession()

  const order = await prisma.order.create({
    data: {
      ...customer,
      userId: session?.userId ?? null,
      subtotal,
      discount,
      couponCode: appliedCoupon,
      shipping,
      total,
      // Awaiting payment; the webhook flips this to PAID and takes the stock.
      status: 'PENDING',
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

  const stripe = getStripe()

  const discountedLines = applyDiscountToLines(
    lines.map((line) => ({
      unitAmount: productById.get(line.productId)!.price,
      quantity: line.quantity,
    })),
    discount,
  )

  let stripeSession: Stripe.Checkout.Session
  try {
    stripeSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: customer.email,
        client_reference_id: order.id,
        metadata: { orderId: order.id },
        success_url: `${origin}/checkout/success?id=${order.id}`,
        cancel_url: `${origin}/checkout?cancelled=1`,
        line_items: [
          ...lines.map((line, index) => {
            const product = productById.get(line.productId)!
            return {
              quantity: line.quantity,
              price_data: {
                currency: 'usd',
                unit_amount: discountedLines[index].unitAmount,
                product_data: {
                  name: `${product.name} — ${line.color}, ${line.size}`,
                },
              },
            }
          }),
          ...(shipping > 0
            ? [
                {
                  quantity: 1,
                  price_data: {
                    currency: 'usd',
                    unit_amount: shipping,
                    product_data: { name: 'Shipping' },
                  },
                },
              ]
            : []),
        ],
    })
  } catch (error) {
    // Do not leave a PENDING order behind for a payment session that never
    // started, and never leak provider internals to the shopper.
    await prisma.order.updateMany({
      where: { id: order.id, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    })

    const detail = error instanceof Error ? error.message : 'unknown error'
    console.error('Stripe session creation failed:', detail)

    return NextResponse.json(
      { error: 'Could not start the payment session. Please try again.' },
      { status: 502 },
    )
  }


  await prisma.order.update({
    where: { id: order.id },
    data: { paymentReference: stripeSession.id },
  })

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    url: stripeSession.url,
    total,
  })
}
