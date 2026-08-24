'use client'

import { useState } from 'react'

/**
 * Local-only newsletter form. Persisting subscribers would need a table +
 * route handler, which is out of scope for the storefront demo.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'done'>('idle')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setStatus('done')
      }}
      className="mt-4 flex max-w-sm gap-2"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full border border-line bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-stone/70 focus:border-ink focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 bg-bone px-5 py-2.5 text-xs tracking-[0.14em] text-ink uppercase transition-colors hover:bg-clay hover:text-bone"
      >
        {status === 'done' ? 'Joined ✓' : 'Join'}
      </button>
    </form>
  )
}
