import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getStripe, stripeWebhookSecret } from '@/lib/stripe'

/**
 * Stripe webhook.
 *
 * Configure an endpoint in Stripe pointing at `/api/webhooks/stripe` with at
 * least these events:
 *   - checkout.session.completed
 *   - checkout.session.expired
 *   - checkout.session.async_payment_failed
 * then set STRIPE_WEBHOOK_SECRET to the endpoint's signing secret.
 *
 * This is the only place that marks an order paid, so the storefront can never
 * be tricked into confirming a payment by calling an API directly.
 */
export async function POST(request: Request) {
  let event: Stripe.Event

  try {
    // Signature verification needs the exact raw bytes, not a parsed body.
    const rawBody = await request.text()
    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    event = getStripe().webhooks.constructEvent(rawBody, signature, stripeWebhookSecret())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid payload'
    return NextResponse.json({ error: `Webhook verification failed: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await markPaid(event.data.object)
        break
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed':
        await markCancelled(event.data.object)
        break
      default:
        break
    }
  } catch (error) {
    // Return 500 so Stripe retries rather than silently dropping the event.
    const message = error instanceof Error ? error.message : 'Handler failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function markPaid(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId ?? session.client_reference_id
  if (!orderId) return

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })
  if (!order || order.status === 'PAID') return // already handled (Stripe retries)

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      })

      if (updated.count === 0) {
        // Sold out while the customer was on Stripe's page.
        throw new Error(
          `${item.name} sold out before payment completed — the order needs manual review.`,
        )
      }
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paymentReference: session.payment_intent?.toString() ?? session.id,
      },
    })

    if (order.couponCode) {
      await tx.coupon.update({
        where: { code: order.couponCode },
        data: { usedCount: { increment: 1 } },
      })
    }
  })
}

async function markCancelled(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId ?? session.client_reference_id
  if (!orderId) return

  await prisma.order.updateMany({
    where: { id: orderId, status: 'PENDING' },
    data: { status: 'CANCELLED' },
  })
}
