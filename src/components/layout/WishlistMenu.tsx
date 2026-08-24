'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useWishlist } from '@/lib/wishlist'
import { formatPrice } from '@/lib/format'
import { HeartIcon } from '@/components/ui/icons'

/** Header favourites button with a dropdown of saved pieces. */
export function WishlistMenu() {
  const { items, hydrated, count, clear } = useWishlist()
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Favourites${hydrated && count > 0 ? `, ${count} saved` : ''}`}
        aria-expanded={open}
        className="relative rounded-full p-2.5 text-ink-soft transition-colors hover:bg-bone-100 hover:text-ink"
      >
        <HeartIcon className="h-5 w-5" filled={hydrated && count > 0} />
        {hydrated && count > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-medium text-bone">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-72 border border-line bg-bone shadow-lift">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-xs tracking-[0.14em] uppercase">Saved</p>
            {count > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-xs text-stone underline transition-colors hover:text-clay"
              >
                Clear
              </button>
            )}
          </div>

          {!hydrated || count === 0 ? (
            <p className="px-4 py-6 text-sm text-stone">
              Tap the heart on any product to save it here.
            </p>
          ) : (
            <>
              <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bone-100"
                    >
                      <span className="h-14 w-11 shrink-0 overflow-hidden bg-bone-100">
                        <Image
                          src={item.imageUrl}
                          alt=""
                          width={120}
                          height={150}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="flex-1 text-sm leading-snug">{item.name}</span>
                      <span className="text-sm tabular-nums">{formatPrice(item.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  router.push('/catalog')
                }}
                className="block w-full border-t border-line px-4 py-3 text-xs tracking-[0.14em] text-stone uppercase transition-colors hover:bg-bone-100 hover:text-ink"
              >
                Keep browsing
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
