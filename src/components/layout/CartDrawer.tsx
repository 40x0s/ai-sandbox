'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { useCart, FREE_SHIPPING_THRESHOLD } from '@/lib/cart'
import { useScrollLock, useUi } from '@/lib/ui'
import { formatPrice } from '@/lib/format'

/** Slide-over mini cart. Opens from the header bag, quick-add and toasts. */
export function CartDrawer() {
  const { cartOpen, closeCart } = useUi()
  const { items, hydrated, count, subtotal, shipping, total, setQuantity, removeItem } = useCart()

  useScrollLock(cartOpen)

  useEffect(() => {
    if (!cartOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cartOpen, closeCart])

  if (!cartOpen) return null

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <button
        type="button"
        aria-label="Close bag"
        onClick={closeCart}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-[fade-in_160ms_ease-out]"
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bone shadow-lift animate-[drawer-in_240ms_cubic-bezier(0.22,1,0.36,1)]">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm tracking-[0.14em] uppercase">
            Your bag {hydrated && count > 0 && <span className="text-stone">({count})</span>}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close"
            className="rounded-full p-2 text-stone transition-colors hover:bg-bone-100 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {!hydrated ? (
          <p className="p-6 text-sm text-stone">Loading…</p>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm text-stone">Your bag is empty.</p>
            <Link
              href="/catalog"
              onClick={closeCart}
              className="bg-ink px-6 py-3 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-5 py-3">
              <div className="h-1 w-full overflow-hidden bg-bone-100">
                <div
                  className="h-full bg-clay transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-stone">
                {remaining > 0
                  ? `${formatPrice(remaining)} away from free shipping`
                  : 'Free shipping unlocked ✓'}
              </p>
            </div>

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-4">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="h-24 w-20 shrink-0 overflow-hidden bg-bone-100"
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={240}
                      height={300}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <p className="text-sm leading-snug font-medium">{item.name}</p>
                      <p className="text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <p className="mt-1 flex items-center gap-2 text-xs text-stone">
                      <span
                        className="h-3 w-3 rounded-full ring-1 ring-ink/15"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      {item.color} · {item.size}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          className="px-2.5 py-1 transition-colors hover:bg-bone-100"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-xs tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                          className="px-2.5 py-1 transition-colors hover:bg-bone-100 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="text-xs text-stone underline transition-colors hover:text-clay"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-5 py-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-stone">Subtotal</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone">Shipping</dt>
                  <dd className="tabular-nums">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2 font-medium">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 block bg-ink px-6 py-3.5 text-center text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-2 block border border-line px-6 py-3 text-center text-xs tracking-[0.16em] uppercase transition-colors hover:border-ink"
              >
                View full bag
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
