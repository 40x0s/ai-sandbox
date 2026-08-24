'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart, FREE_SHIPPING_THRESHOLD } from '@/lib/cart'
import { formatPrice } from '@/lib/format'

export function CartView() {
  const { items, hydrated, subtotal, shipping, total, setQuantity, removeItem, clearCart } = useCart()

  // Render a stable shell on the server and on first paint, then the real cart.
  if (!hydrated) {
    return <p className="py-24 text-center text-sm text-stone">Loading your bag…</p>
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Your bag is empty</h1>
        <p className="mx-auto mt-3 max-w-sm text-stone">
          Nothing here yet. Start with the new season essentials.
        </p>
        <Link
          href="/catalog"
          className="mt-8 inline-flex bg-ink px-8 py-3.5 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay"
        >
          Shop the collection
        </Link>
      </div>
    )
  }

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
      <section>
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h2 className="text-sm text-stone">
            {items.length} {items.length === 1 ? 'line' : 'lines'}
          </h2>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-stone underline transition-colors hover:text-clay"
          >
            Empty bag
          </button>
        </div>

        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.key} className="flex gap-5 py-6">
              <Link
                href={`/products/${item.slug}`}
                className="h-28 w-22 shrink-0 overflow-hidden bg-bone-100"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={300}
                  height={380}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-medium hover:text-clay"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 flex items-center gap-2 text-xs text-stone">
                      <span
                        className="h-3 w-3 rounded-full ring-1 ring-ink/15"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      {item.color} · Size {item.size}
                    </p>
                  </div>
                  <p className="text-sm font-medium tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                  <div className="flex items-center border border-line">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                      className="px-3 py-1.5 transition-colors hover:bg-bone-100"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => setQuantity(item.key, item.quantity + 1)}
                      disabled={item.quantity >= item.maxQuantity}
                      className="px-3 py-1.5 transition-colors hover:bg-bone-100 disabled:opacity-40"
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
      </section>

      <aside className="h-fit border border-line bg-bone-100/60 p-6 lg:sticky lg:top-32">
        <h2 className="text-sm font-medium tracking-[0.14em] uppercase">Order summary</h2>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone">Shipping</dt>
            <dd className="tabular-nums">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(total)}</dd>
          </div>
        </dl>

        {remainingForFreeShipping > 0 ? (
          <p className="mt-4 text-xs text-stone">
            Add {formatPrice(remainingForFreeShipping)} more for free shipping.
          </p>
        ) : (
          <p className="mt-4 text-xs text-sage">Free shipping unlocked ✓</p>
        )}

        <Link
          href="/checkout"
          className="mt-6 block bg-ink px-6 py-3.5 text-center text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay"
        >
          Checkout
        </Link>
        <Link
          href="/catalog"
          className="mt-3 block border border-line px-6 py-3.5 text-center text-xs tracking-[0.16em] uppercase transition-colors hover:border-ink"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  )
}
