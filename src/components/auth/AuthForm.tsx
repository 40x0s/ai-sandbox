'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = { mode: 'login' | 'register'; next?: string }

export function AuthForm({ mode, next }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const isLogin = mode === 'login'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(event.currentTarget)
    const payload = {
      ...(isLogin ? {} : { name: String(form.get('name') ?? '') }),
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    }

    try {
      const response = await fetch(isLogin ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      router.push(next && next.startsWith('/') ? next : '/')
      router.refresh() // re-render server components that read the session cookie
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setPending(false)
    }
  }

  const inputClass =
    'w-full border border-line bg-transparent px-4 py-3 text-sm focus:border-ink focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {!isLogin && (
        <div>
          <label htmlFor="name" className="eyebrow text-stone">
            Full name
          </label>
          <input id="name" name="name" required minLength={2} className={inputClass} autoComplete="name" />
        </div>
      )}

      <div>
        <label htmlFor="email" className="eyebrow text-stone">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={inputClass}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="eyebrow text-stone">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={isLogin ? undefined : 8}
          className={inputClass}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
        />
        {!isLogin && <p className="mt-2 text-xs text-stone">At least 8 characters.</p>}
      </div>

      {error && (
        <p role="alert" className="border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-ink px-6 py-3.5 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay disabled:opacity-50"
      >
        {pending ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
      </button>
    </form>
  )
}
