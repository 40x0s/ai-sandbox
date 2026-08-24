'use client'

import { useUi } from '@/lib/ui'
import { BagIcon } from '@/components/ui/icons'
import { CartCount } from './CartCount'

/** Header bag — opens the slide-over drawer instead of navigating away. */
export function BagButton() {
  const { openCart } = useUi()

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Open shopping bag"
      className="relative rounded-full p-2.5 text-ink-soft transition-colors hover:bg-bone-100 hover:text-ink"
    >
      <BagIcon className="h-5 w-5" />
      <CartCount />
    </button>
  )
}
