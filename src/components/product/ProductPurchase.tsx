'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'

type Option = { label: string; hex?: string }

type Props = {
  productId: string
  slug: string
  name: string
  imageUrl: string
  price: number
  stock: number
  sizes: Option[]
  colors: Option[]
}

export function ProductPurchase({
  productId,
  slug,
  name,
  imageUrl,
  price,
  stock,
  sizes,
  colors,
}: Props) {
  const { addItem, count, hydrated } = useCart()
  const [size, setSize] = useState(sizes[0]?.label ?? '')
  const [color, setColor] = useState(colors[0]?.label ?? '')
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  const soldOut = stock <= 0
  const colorHex = colors.find((c) => c.label === color)?.hex ?? '#cccccc'

  function handleAdd() {
    if (soldOut || !size || !color) return
    addItem({
      productId,
      slug,
      name,
      imageUrl,
      price,
      size,
      color,
      colorHex,
      quantity,
      maxQuantity: Math.max(1, stock),
    })
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 2500)
  }

  if (soldOut) {
    return (
      <div className="mt-8">
        <p className="border border-line bg-bone-100 px-5 py-4 text-sm text-stone">
          This piece is sold out. Restocks are announced in the ATELIER letter.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-7">
      {/* Colour */}
      {colors.length > 0 && (
        <fieldset>
          <legend className="eyebrow text-stone">
            Colour — <span className="normal-case tracking-normal">{color}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {colors.map((option) => (
              <button
                key={option.label}
                type="button"
                aria-label={option.label}
                aria-pressed={color === option.label}
                onClick={() => setColor(option.label)}
                className={`h-9 w-9 rounded-full ring-1 ring-ink/15 transition-all ${
                  color === option.label ? 'ring-2 ring-ink ring-offset-2 ring-offset-bone' : ''
                }`}
                style={{ backgroundColor: option.hex ?? '#cccccc' }}
              />
            ))}
          </div>
        </fieldset>
      )}

      {/* Size */}
      {sizes.length > 0 && (
        <fieldset>
          <legend className="eyebrow text-stone">Size</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={size === option.label}
                onClick={() => setSize(option.label)}
                className={`min-w-12 border px-4 py-2.5 text-sm transition-colors ${
                  size === option.label
                    ? 'border-ink bg-ink text-bone'
                    : 'border-line hover:border-ink/40'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Quantity + add */}
      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex items-center border border-line">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-4 py-3 text-lg leading-none transition-colors hover:bg-bone-100"
          >
            −
          </button>
          <span aria-live="polite" className="w-10 text-center text-sm tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            className="px-4 py-3 text-lg leading-none transition-colors hover:bg-bone-100"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!size || !color}
          className="flex-1 bg-ink px-8 py-3.5 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:min-w-56"
        >
          {justAdded ? 'Added to bag ✓' : `Add to bag — ${formatPrice(price * quantity)}`}
        </button>
      </div>

      <p className="text-sm text-stone" aria-live="polite">
        {hydrated && justAdded ? (
          <a href="/cart" className="underline hover:text-ink">
            View bag ({count} item{count === 1 ? '' : 's'})
          </a>
        ) : (
          <>
            {stock <= 10 ? `Only ${stock} left in stock` : 'In stock'} · ships in 1–2 business days
          </>
        )}
      </p>

      <p className="sr-only">{`${name}, ${color}, size ${size}, ${formatPrice(price)}`}</p>
    </div>
  )
}
