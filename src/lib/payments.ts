import { randomBytes } from 'node:crypto'

/**
 * Payment capture.
 *
 * Today this is a SIMULATION: no provider is called and no money moves. The
 * orders API depends only on `capturePayment`, so moving to a real provider
 * (Stripe, Paymob, Checkout.com…) means implementing the `live` branch below
 * and nothing else.
 */

export type PaymentResult =
  | { ok: true; reference: string }
  | { ok: false; error: string }

export function paymentsMode(): 'simulated' | 'live' {
  return process.env.PAYMENTS_MODE === 'live' ? 'live' : 'simulated'
}

export async function capturePayment(input: {
  amountCents: number
  currency?: string
  email?: string
}): Promise<PaymentResult> {
  if (input.amountCents <= 0) {
    return { ok: false, error: 'Nothing to charge.' }
  }

  if (paymentsMode() === 'live') {
    // Fail loudly rather than silently marking an unpaid order as paid.
    return {
      ok: false,
      error:
        'PAYMENTS_MODE=live but no provider is wired up. Implement capturePayment() in src/lib/payments.ts.',
    }
  }

  return {
    ok: true,
    reference: `sim_${randomBytes(8).toString('hex')}`,
  }
}
