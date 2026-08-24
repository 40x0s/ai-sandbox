'use client'

import { useWishlist } from '@/lib/wishlist'
import { useUi } from '@/lib/ui'
import { HeartIcon } from '@/components/ui/icons'

type Props = {
  product: { id: string; slug: string; name: string; imageUrl: string; price: number }
}

/** Heart toggle on product cards and the product page. */
export function WishlistToggle({ product }: Props) {
  const { has, toggle } = useWishlist()
  const { notify } = useUi()
  const saved = has(product.id)

  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${product.name} from favourites` : `Save ${product.name}`}
      aria-pressed={saved}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggle(product)
        notify(saved ? 'Removed from favourites' : 'Saved to favourites')
      }}
      className={`rounded-full bg-bone/85 p-2 backdrop-blur-sm transition-all hover:bg-bone ${
        saved ? 'text-clay' : 'text-ink-soft'
      }`}
    >
      <HeartIcon className="h-4 w-4" filled={saved} />
    </button>
  )
}
