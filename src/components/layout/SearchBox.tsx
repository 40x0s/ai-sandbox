'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { formatPrice } from '@/lib/format'
import { SearchIcon } from '@/components/ui/icons'

type Hit = {
  id: string
  slug: string
  name: string
  price: number
  imageUrl: string
  categoryName: string
}

/** Live product search with debounced requests and keyboard support. */
export function SearchBox() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [cursor, setCursor] = useState(-1)
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced fetch, with an AbortController so stale responses can't win.
  useEffect(() => {
    const term = query.trim()
    const controller = new AbortController()

    // All state updates happen inside the timer callback, never synchronously
    // in the effect body.
    const timer = setTimeout(async () => {
      if (term.length < 2) {
        setHits([])
        setPending(false)
        return
      }
      setPending(true)
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        })
        const data = await response.json().catch(() => ({ results: [] }))
        setHits(Array.isArray(data.results) ? data.results : [])
      } catch {
        // aborted or offline — keep whatever is on screen
      } finally {
        setPending(false)
      }
    }, term.length < 2 ? 0 : 220)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  // Close on outside click.
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const go = useCallback(
    (href: string) => {
      setOpen(false)
      setQuery('')
      inputRef.current?.blur()
      router.push(href)
    },
    [router],
  )

  const showPanel = open && query.trim().length >= 2

  return (
    <div ref={boxRef} className="relative w-full max-w-sm">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          const term = query.trim()
          if (!term) return
          if (cursor >= 0 && hits[cursor]) {
            go(`/products/${hits[cursor].slug}`)
            return
          }
          go(`/catalog?q=${encodeURIComponent(term)}`)
        }}
      >
        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone" />
        <input
          id="site-search"
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Search products…"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            setCursor(-1)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false)
              inputRef.current?.blur()
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setCursor((c) => Math.min(c + 1, hits.length - 1))
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setCursor((c) => Math.max(c - 1, -1))
            }
          }}
          className="w-full border border-line bg-transparent py-2.5 pr-3 pl-9 text-sm transition-colors focus:border-ink focus:outline-none"
        />
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 max-h-96 overflow-y-auto border border-line bg-bone shadow-lift">
          {pending && hits.length === 0 && (
            <p className="px-4 py-3 text-sm text-stone">Searching…</p>
          )}

          {!pending && hits.length === 0 && (
            <p className="px-4 py-3 text-sm text-stone">
              No matches for “{query.trim()}”.
            </p>
          )}

          {hits.map((hit, index) => (
            <button
              key={hit.id}
              type="button"
              onMouseEnter={() => setCursor(index)}
              onClick={() => go(`/products/${hit.slug}`)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                index === cursor ? 'bg-bone-100' : 'hover:bg-bone-100'
              }`}
            >
              <span className="h-12 w-10 shrink-0 overflow-hidden bg-bone-100">
                <Image
                  src={hit.imageUrl}
                  alt=""
                  width={120}
                  height={150}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="flex-1">
                <span className="block text-sm leading-snug">{hit.name}</span>
                <span className="block text-xs text-stone">{hit.categoryName}</span>
              </span>
              <span className="text-sm tabular-nums">{formatPrice(hit.price)}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => go(`/catalog?q=${encodeURIComponent(query.trim())}`)}
            className="block w-full border-t border-line px-4 py-2.5 text-left text-xs tracking-[0.14em] text-stone uppercase transition-colors hover:bg-bone-100 hover:text-ink"
          >
            See all results
          </button>
        </div>
      )}
    </div>
  )
}
