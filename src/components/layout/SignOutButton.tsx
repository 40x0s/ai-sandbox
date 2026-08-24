'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/')
        router.refresh()
      }}
      className="text-sm text-ink-soft transition-colors hover:text-clay"
    >
      Sign out
    </button>
  )
}
