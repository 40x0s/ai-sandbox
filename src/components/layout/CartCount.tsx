'use client'

import { useCart } from '@/lib/cart'

/** Badge on the header bag icon. Renders nothing until the stored cart is loaded. */
export function CartCount() {
  const { count, hydrated } = useCart()

  if (!hydrated || count === 0) return null

  return (
    <span
      aria-label={`${count} item${count === 1 ? '' : 's'} in cart`}
      className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-medium text-bone"
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
