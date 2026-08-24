import Stripe from 'stripe'

/**
 * Stripe client. Created lazily so the app boots (and the demo runs) without
 * any Stripe credentials — see paymentMode() in ./payments.
 */

let client: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add your secret key (sk_test_… or sk_live_…) to the environment.',
    )
  }

  if (!client) {
    client = new Stripe(key, {
      // Pin the app info Stripe shows in its dashboard.
      appInfo: { name: 'ATELIER storefront', version: '1.0.0' },
    })
  }

  return client
}

export function stripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not set. Create a webhook endpoint in Stripe ' +
        '(event: checkout.session.completed) and copy its signing secret (whsec_…).',
    )
  }
  return secret
}
