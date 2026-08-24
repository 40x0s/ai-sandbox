'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { useUi } from '@/lib/ui'

type Props = {
  product: {
    id: string
    slug: string
    name: string
    imageUrl: string
    price: number
    stock: number
  }
  sizes: { label: string }[]
  colors: { name: string; hex: string }[]
}

/**
 * Add to bag straight from the grid: reveals a size row, then adds with the
 * product's first colour and opens the mini cart.
 */
export function QuickAdd({ product, sizes, colors }: Props) {
  const { addItem } = useCart()
  const { notify, openCart } = useUi()
  const [choosing, setChoosing] = useState(false)

  const soldOut = product.stock <= 0
  const color = colors[0]

  if (soldOut) return null

  // One-size products skip the size step entirely.
  const effectiveSizes = sizes.length > 0 ? sizes : [{ label: 'One size' }]

  function add(size: string) {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      size,
      color: color?.name ?? 'Default',
      colorHex: color?.hex ?? '#cccccc',
      quantity: 1,
      maxQuantity: product.stock,
    })
    setChoosing(false)
    notify(`${product.name} added to bag`, { label: 'View bag', onClick: openCart })
    openCart()
  }

  if (!choosing) {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setChoosing(true)
        }}
        className="w-full bg-bone/95 py-2.5 text-[11px] tracking-[0.16em] uppercase backdrop-blur-sm transition-colors hover:bg-ink hover:text-bone"
      >
        Quick add
      </button>
    )
  }

  return (
    <div
      onClick={(event) => event.preventDefault()}
      className="flex w-full flex-wrap items-center justify-center gap-1.5 bg-bone/95 px-2 py-2 backdrop-blur-sm"
    >
      {effectiveSizes.map((size) => (
        <button
          key={size.label}
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            add(size.label)
          }}
          className="min-w-8 border border-line px-2 py-1 text-xs transition-colors hover:border-ink hover:bg-ink hover:text-bone"
        >
          {size.label}
        </button>
      ))}
      <button
        type="button"
        aria-label="Cancel quick add"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setChoosing(false)
        }}
        className="px-1 text-xs text-stone transition-colors hover:text-ink"
      >
        ×
      </button>
    </div>
  )
}
