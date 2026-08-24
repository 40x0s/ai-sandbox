'use client'

import { COMPARE_LIMIT, useCompare, type CompareItem } from '@/lib/compare'
import { useUi } from '@/lib/ui'

/** "Compare" pill on product cards. Caps the tray at COMPARE_LIMIT items. */
export function CompareToggle({ product }: { product: CompareItem }) {
  const { has, toggle } = useCompare()
  const { notify } = useUi()
  const selected = has(product.id)

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        const result = toggle(product)
        if (!result.ok) {
          notify(`You can compare up to ${COMPARE_LIMIT} products at a time`)
          return
        }
      }}
      className={`flex items-center gap-1.5 border px-2.5 py-1 text-[11px] tracking-[0.08em] uppercase backdrop-blur-sm transition-colors ${
        selected
          ? 'border-ink bg-ink text-bone'
          : 'border-line bg-bone/85 text-ink-soft hover:border-ink'
      }`}
    >
      <span
        aria-hidden
        className={`flex h-3 w-3 items-center justify-center border text-[9px] ${
          selected ? 'border-bone' : 'border-stone'
        }`}
      >
        {selected ? '✓' : ''}
      </span>
      Compare
    </button>
  )
}
