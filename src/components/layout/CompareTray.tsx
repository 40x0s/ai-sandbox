'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCompare } from '@/lib/compare'

/** Floating tray listing the products selected for comparison. */
export function CompareTray() {
  const { items, hydrated, clear } = useCompare()

  if (!hydrated || items.length === 0) return null

  const ids = items.map((item) => item.id).join(',')

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bone/95 backdrop-blur-md">
      <div className="container-x flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <p className="hidden shrink-0 text-xs tracking-[0.14em] text-stone uppercase sm:block">
          Compare ({items.length})
        </p>

        <ul className="flex flex-1 items-center gap-3 overflow-x-auto">
          {items.map((item) => (
            <li key={item.id} className="flex shrink-0 items-center gap-2 border border-line px-2 py-1.5">
              <span className="h-9 w-8 overflow-hidden bg-bone-100">
                <Image
                  src={item.imageUrl}
                  alt=""
                  width={96}
                  height={120}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="max-w-32 truncate text-xs">{item.name}</span>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={clear}
            className="text-xs text-stone underline transition-colors hover:text-clay"
          >
            Clear
          </button>
          <Link
            href={`/compare?ids=${encodeURIComponent(ids)}`}
            className="bg-ink px-5 py-2.5 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay"
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  )
}
