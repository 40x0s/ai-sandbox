'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { StarIcon } from '@/components/ui/icons'

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(5)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <p className="border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-sage">
        Thank you — your review is live.
      </p>
    )
  }

  const inputClass =
    'w-full border border-line bg-transparent px-3 py-2.5 text-sm focus:border-ink focus:outline-none'

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        setError(null)
        setPending(true)

        const form = new FormData(event.currentTarget)
        try {
          const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId,
              author: String(form.get('author') ?? ''),
              rating,
              title: String(form.get('title') ?? ''),
              body: String(form.get('body') ?? ''),
            }),
          })
          const data = await response.json().catch(() => ({}))

          if (!response.ok) {
            setError(data.error ?? 'Could not save your review.')
            return
          }

          setDone(true)
          router.refresh() // re-read the review list and the new average
        } catch {
          setError('Network error. Please try again.')
        } finally {
          setPending(false)
        }
      }}
      className="space-y-4 border border-line bg-bone-100/50 p-5"
    >
      <p className="text-sm font-medium">Write a review</p>

      <fieldset>
        <legend className="eyebrow text-stone">Your rating</legend>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
              aria-pressed={rating === value}
              onClick={() => setRating(value)}
              className="p-1 transition-transform hover:scale-110"
            >
              <StarIcon
                className={`h-5 w-5 ${value <= rating ? 'text-clay' : 'text-line'}`}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="review-author" className="eyebrow text-stone">
            Name
          </label>
          <input id="review-author" name="author" required minLength={2} className={inputClass} />
        </div>
        <div>
          <label htmlFor="review-title" className="eyebrow text-stone">
            Headline (optional)
          </label>
          <input id="review-title" name="title" maxLength={120} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="review-body" className="eyebrow text-stone">
          Your review
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-ink px-6 py-3 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay disabled:opacity-50"
      >
        {pending ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  )
}
