'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRecentlyViewed, type RecentItem } from '@/lib/recent'
import { formatPrice } from '@/lib/format'

/**
 * Records the product being viewed, then shows the previously viewed ones.
 * `record` is idempotent, so mounting twice cannot loop.
 */
export function RecentlyViewed({
  id,
  slug,
  name,
  imageUrl,
  price,
}: RecentItem) {
  const { items, hydrated, record } = useRecentlyViewed()

  useEffect(() => {
    record({ id, slug, name, imageUrl, price })
  }, [record, id, slug, name, imageUrl, price])

  // Everything except the product we are currently on.
  const others = items.filter((item) => item.id !== id)

  if (!hydrated || others.length === 0) return null

  return (
    <section className="mt-16 border-t border-line pt-10">
      <h2 className="text-sm font-medium tracking-[0.14em] uppercase">Recently viewed</h2>
      <ul className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {others.map((item) => (
          <li key={item.id} className="w-32 shrink-0">
            <Link href={`/products/${item.slug}`} className="group block">
              <span className="block aspect-4/5 overflow-hidden bg-bone-100">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={256}
                  height={320}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
              <span className="mt-2 block text-xs leading-snug group-hover:text-clay">{item.name}</span>
              <span className="mt-0.5 block text-xs tabular-nums text-stone">
                {formatPrice(item.price)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
