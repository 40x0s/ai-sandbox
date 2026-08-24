import { randomBytes } from 'node:crypto'

/**
 * Payment seam.
 *
 * `simulated` — no provider is called, orders are marked paid immediately.
 *               This is what runs when STRIPE_SECRET_KEY is absent, so the demo
 *               keeps working with zero configuration.
 * `stripe`    — real Stripe Checkout. Enabled automatically as soon as
 *               STRIPE_SECRET_KEY is present in the environment.
 *
 * Set PAYMENTS_MODE=simulated to force the demo path even when a key is set.
 */

export type PaymentMode = 'simulated' | 'stripe'

export type PaymentResult =
  | { ok: true; reference: string }
  | { ok: false; error: string }

export function paymentMode(): PaymentMode {
  if (process.env.PAYMENTS_MODE === 'simulated') return 'simulated'
  return process.env.STRIPE_SECRET_KEY ? 'stripe' : 'simulated'
}

/** Simulated capture — used by the demo path only. */
export async function capturePayment(input: {
  amountCents: number
  currency?: string
  email?: string
}): Promise<PaymentResult> {
  if (input.amountCents <= 0) {
    return { ok: false, error: 'Nothing to charge.' }
  }

  if (paymentMode() === 'stripe') {
    // A real provider must never fall through to the simulation.
    return {
      ok: false,
      error: 'Stripe mode is enabled; use POST /api/checkout/session instead of capturePayment().',
    }
  }

  return {
    ok: true,
    reference: `sim_${randomBytes(8).toString('hex')}`,
  }
}

/**
 * Distributes a whole-order discount across line items so the Stripe session
 * total matches the storefront exactly. Stripe does not accept negative line
 * items, and rounding each line independently would drift by a cent or two, so
 * the remainder is absorbed by the last line.
 */
export function applyDiscountToLines(
  lines: { unitAmount: number; quantity: number }[],
  discountCents: number,
): { unitAmount: number; quantity: number }[] {
  if (discountCents <= 0) return lines

  const subtotal = lines.reduce((sum, line) => sum + line.unitAmount * line.quantity, 0)
  if (subtotal <= 0) return lines

  let allocated = 0
  const result = lines.map((line, index) => {
    const isLast = index === lines.length - 1
    const share = isLast
      ? discountCents - allocated
      : Math.round((line.unitAmount * line.quantity * discountCents) / subtotal)
    allocated += share

    const lineTotal = Math.max(0, line.unitAmount * line.quantity - share)
    const unit = Math.floor(lineTotal / line.quantity)

    return { unitAmount: unit, quantity: line.quantity }
  })

  return result
}
