'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'

export function CheckoutForm({ mode = 'simulated' }: { mode?: 'simulated' | 'stripe' }) {
  const isStripe = mode === 'stripe'
  const router = useRouter()
  const { items, hydrated, subtotal, shipping, total, clearCart } = useCart()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState<{ code: string; percentOff: number; discount: number } | null>(
    null,
  )
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponPending, setCouponPending] = useState(false)

  const payableTotal = Math.max(0, total - (coupon?.discount ?? 0))

  if (!hydrated) {
    return <p className="py-24 text-center text-sm text-stone">Loading your bag…</p>
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Nothing to check out</h2>
        <p className="mt-3 text-stone">Your bag is empty.</p>
        <Link
          href="/catalog"
          className="mt-8 inline-flex bg-ink px-8 py-3.5 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay"
        >
          Shop the collection
        </Link>
      </div>
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(event.currentTarget)
    const payload = {
      email: String(form.get('email') ?? ''),
      fullName: String(form.get('fullName') ?? ''),
      address: String(form.get('address') ?? ''),
      city: String(form.get('city') ?? ''),
      postcode: String(form.get('postcode') ?? ''),
      country: String(form.get('country') ?? ''),
      ...(coupon ? { couponCode: coupon.code } : {}),
      lines: items.map((item) => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      })),
    }

    try {
      const endpoint = isStripe ? '/api/checkout/session' : '/api/orders'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error ?? 'We could not place the order. Please try again.')
        return
      }

      clearCart()

      if (isStripe && data.url) {
        // Hand off to Stripe's hosted payment page; the webhook confirms the order.
        window.location.href = data.url
        return
      }

      router.push(`/checkout/success?id=${data.orderId}`)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setPending(false)
    }
  }

  const inputClass =
    'w-full border border-line bg-transparent px-4 py-3 text-sm focus:border-ink focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-8">
        <fieldset className="space-y-5">
          <legend className="eyebrow text-stone">Contact</legend>
          <div>
            <label htmlFor="email" className="eyebrow text-stone">
              Email
            </label>
            <input id="email" name="email" type="email" required className={inputClass} autoComplete="email" />
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="eyebrow text-stone">Shipping address</legend>
          <div>
            <label htmlFor="fullName" className="eyebrow text-stone">
              Full name
            </label>
            <input id="fullName" name="fullName" required className={inputClass} autoComplete="name" />
          </div>
          <div>
            <label htmlFor="address" className="eyebrow text-stone">
              Street address
            </label>
            <input id="address" name="address" required className={inputClass} autoComplete="street-address" />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="eyebrow text-stone">
                City
              </label>
              <input id="city" name="city" required className={inputClass} autoComplete="address-level2" />
            </div>
            <div>
              <label htmlFor="postcode" className="eyebrow text-stone">
                Postcode
              </label>
              <input id="postcode" name="postcode" required className={inputClass} autoComplete="postal-code" />
            </div>
            <div>
              <label htmlFor="country" className="eyebrow text-stone">
                Country
              </label>
              <input
                id="country"
                name="country"
                required
                defaultValue="Saudi Arabia"
                className={inputClass}
                autoComplete="country-name"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3 border border-dashed border-line p-5">
          <legend className="eyebrow text-stone">
            {isStripe ? 'Payment' : 'Payment (simulated)'}
          </legend>
          {isStripe ? (
            <p className="text-sm text-stone">
              You will be redirected to Stripe&apos;s secure checkout. Card details never touch
              this server; the order is confirmed by webhook.
            </p>
          ) : (
            <>
              <p className="text-sm text-stone">
                No payment provider is configured, so this is a simulation — no card is charged.
                Set <code className="font-mono">STRIPE_SECRET_KEY</code> to enable real Stripe
                Checkout.
              </p>
              <input
                name="card"
                placeholder="4242 4242 4242 4242"
                className={`${inputClass} bg-bone-100/60`}
                inputMode="numeric"
              />
            </>
          )}
        </fieldset>

        {error && (
          <p role="alert" className="border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ink px-6 py-4 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay disabled:opacity-50"
        >
          {pending
            ? isStripe
              ? 'Redirecting to Stripe…'
              : 'Placing order…'
            : isStripe
              ? `Pay ${formatPrice(payableTotal)}`
              : `Place order — ${formatPrice(payableTotal)}`}
        </button>
      </div>

      <aside className="h-fit border border-line bg-bone-100/60 p-6 lg:sticky lg:top-32">
        <h2 className="text-sm font-medium tracking-[0.14em] uppercase">Your bag</h2>

        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li key={item.key} className="flex gap-3">
              <div className="h-16 w-14 shrink-0 overflow-hidden bg-bone-100">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={200}
                  height={240}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium leading-snug">{item.name}</p>
                <p className="mt-0.5 text-xs text-stone">
                  {item.color} · {item.size} · ×{item.quantity}
                </p>
              </div>
              <p className="text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>

        {/* Coupon */}
        <div className="mt-6 border-t border-line pt-5">
          <label htmlFor="coupon" className="eyebrow text-stone">
            Discount code
          </label>
          {coupon ? (
            <div className="mt-2 flex items-center justify-between gap-2 border border-sage/40 bg-sage/10 px-3 py-2 text-sm">
              <span className="font-mono text-xs">
                {coupon.code} · −{coupon.percentOff}%
              </span>
              <button
                type="button"
                onClick={() => {
                  setCoupon(null)
                  setCouponInput('')
                  setCouponError(null)
                }}
                className="text-xs text-stone underline hover:text-clay"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              <input
                id="coupon"
                value={couponInput}
                onChange={(event) => {
                  setCouponInput(event.target.value)
                  setCouponError(null)
                }}
                placeholder="WELCOME10"
                className="w-full border border-line bg-transparent px-3 py-2 font-mono text-xs uppercase focus:border-ink focus:outline-none"
              />
              <button
                type="button"
                disabled={couponPending}
                onClick={async () => {
                  setCouponError(null)
                  setCouponPending(true)
                  try {
                    const response = await fetch('/api/coupons', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ code: couponInput, subtotal }),
                    })
                    const data = await response.json().catch(() => ({}))
                    if (!response.ok) {
                      setCouponError(data.error ?? 'That code did not work.')
                      return
                    }
                    setCoupon({
                      code: data.code,
                      percentOff: data.percentOff,
                      discount: data.discount,
                    })
                  } catch {
                    setCouponError('Network error. Please try again.')
                  } finally {
                    setCouponPending(false)
                  }
                }}
                className="shrink-0 border border-line px-4 py-2 text-xs tracking-[0.12em] uppercase transition-colors hover:border-ink hover:bg-ink hover:text-bone disabled:opacity-50"
              >
                {couponPending ? '…' : 'Apply'}
              </button>
            </div>
          )}
          {couponError && <p className="mt-2 text-xs text-clay">{couponError}</p>}
        </div>

        <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          {coupon && (
            <div className="flex justify-between text-sage">
              <dt>Discount ({coupon.code})</dt>
              <dd className="tabular-nums">−{formatPrice(coupon.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-stone">Shipping</dt>
            <dd className="tabular-nums">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(payableTotal)}</dd>
          </div>
        </dl>
      </aside>
    </form>
  )
}
