import { StarIcon } from '@/components/ui/icons'
import { ReviewForm } from './ReviewForm'

export type ReviewData = {
  id: string
  author: string
  rating: number
  title: string
  body: string
  createdAt: Date
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <StarIcon
          key={value}
          className={`h-4 w-4 ${value <= Math.round(rating) ? 'text-clay' : 'text-line'}`}
        />
      ))}
    </span>
  )
}

/** Rating summary, distribution bars, the review list and the submit form. */
export function ReviewSection({
  productId,
  reviews,
  average,
}: {
  productId: string
  reviews: ReviewData[]
  average: number
}) {
  const total = reviews.length
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => Math.round(review.rating) === star).length,
  }))

  return (
    <section className="mt-20 border-t border-line pt-12">
      <h2 className="text-2xl font-semibold tracking-tight">Reviews</h2>

      <div className="mt-6 grid gap-10 lg:grid-cols-[16rem_1fr]">
        <div>
          <p className="text-4xl font-semibold tabular-nums">{average.toFixed(1)}</p>
          <div className="mt-2">
            <Stars rating={average} />
          </div>
          <p className="mt-1 text-sm text-stone">
            {total} {total === 1 ? 'review' : 'reviews'}
          </p>

          <ul className="mt-5 space-y-1.5">
            {distribution.map((row) => (
              <li key={row.star} className="flex items-center gap-2 text-xs text-stone">
                <span className="w-3 tabular-nums">{row.star}</span>
                <StarIcon className="h-3 w-3 text-clay" />
                <span className="h-1.5 flex-1 overflow-hidden bg-bone-100">
                  <span
                    className="block h-full bg-clay"
                    style={{ width: total ? `${(row.count / total) * 100}%` : '0%' }}
                  />
                </span>
                <span className="w-4 text-right tabular-nums">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-8">
          {total === 0 ? (
            <p className="text-sm text-stone">No reviews yet — be the first.</p>
          ) : (
            <ul className="space-y-6">
              {reviews.map((review) => (
                <li key={review.id} className="border-b border-line pb-6 last:border-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Stars rating={review.rating} />
                    <time
                      dateTime={review.createdAt.toISOString()}
                      className="text-xs text-stone"
                    >
                      {review.createdAt.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                  {review.title && (
                    <p className="mt-2 text-sm font-medium">{review.title}</p>
                  )}
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{review.body}</p>
                  <p className="mt-2 text-xs text-stone">— {review.author}</p>
                </li>
              ))}
            </ul>
          )}

          <ReviewForm productId={productId} />
        </div>
      </div>
    </section>
  )
}
