'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

const options = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
]

/** Sort control — pushes the new `sort` param while preserving other filters. */
export function SortSelect({ value }: { value: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  return (
    <label className="flex items-center gap-2 text-sm text-stone">
      Sort
      <select
        value={value}
        disabled={isPending}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set('sort', event.target.value)
          startTransition(() => router.push(`${pathname}?${params.toString()}`))
        }}
        className="border border-line bg-transparent px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
