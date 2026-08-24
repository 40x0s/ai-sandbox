'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return
          setPending(true)
          setError(null)
          const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
          if (!response.ok) {
            const data = await response.json().catch(() => ({}))
            setError(data.error ?? 'Could not delete')
            setPending(false)
            return
          }
          router.refresh()
        }}
        className="text-xs text-stone underline transition-colors hover:text-clay disabled:opacity-50"
      >
        {pending ? 'Deleting…' : 'Delete'}
      </button>
      {error && <span className="text-[11px] text-clay">{error}</span>}
    </div>
  )
}
