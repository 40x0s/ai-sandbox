import Link from 'next/link'

type Props = {
  page: number
  totalPages: number
  /** Current query params, so pagination preserves every active filter. */
  searchParams: Record<string, string | string[] | undefined>
}

/** Plain links (no JS) that keep the current filters and jump to a page. */
export function Pagination({ page, totalPages, searchParams }: Props) {
  if (totalPages <= 1) return null

  const hrefFor = (target: number) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === 'page' || value === undefined) continue
      for (const item of Array.isArray(value) ? value : [value]) params.append(key, item)
    }
    if (target > 1) params.set('page', String(target))
    const query = params.toString()
    return query ? `/catalog?${query}` : '/catalog'
  }

  const linkClass =
    'flex h-9 min-w-9 items-center justify-center border border-line px-3 text-sm tabular-nums transition-colors hover:border-ink'

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={linkClass} aria-label="Previous page">
          ←
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) =>
        number === page ? (
          <span
            key={number}
            aria-current="page"
            className="flex h-9 min-w-9 items-center justify-center border border-ink bg-ink px-3 text-sm text-bone tabular-nums"
          >
            {number}
          </span>
        ) : (
          <Link key={number} href={hrefFor(number)} className={linkClass}>
            {number}
          </Link>
        ),
      )}

      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className={linkClass} aria-label="Next page">
          →
        </Link>
      )}
    </nav>
  )
}
