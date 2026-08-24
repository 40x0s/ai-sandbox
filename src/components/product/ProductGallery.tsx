'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

export type GalleryImage = { id: string; url: string; alt: string }

/**
 * Multi-image gallery: large frame with cursor-following zoom, thumbnail
 * strip, arrow buttons and keyboard support.
 */
export function ProductGallery({
  images,
  name,
  badge,
}: {
  images: GalleryImage[]
  name: string
  badge?: React.ReactNode
}) {
  const [index, setIndex] = useState(0)
  const [origin, setOrigin] = useState<string | null>(null)

  const count = images.length
  const active = images[Math.min(index, count - 1)]

  const go = useCallback(
    (delta: number) => setIndex((current) => (current + delta + count) % count),
    [count],
  )

  useEffect(() => {
    if (count < 2) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count, go])

  if (!active) return null

  return (
    <div>
      <div
        className="group relative aspect-4/5 cursor-zoom-in overflow-hidden bg-bone-100"
        onMouseMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect()
          setOrigin(
            `${((event.clientX - box.left) / box.width) * 100}% ${
              ((event.clientY - box.top) / box.height) * 100
            }%`,
          )
        }}
        onMouseLeave={() => setOrigin(null)}
      >
        <Image
          key={active.id}
          src={active.url}
          alt={active.alt || name}
          width={1408}
          height={768}
          priority={index === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.9]"
          style={origin ? { transformOrigin: origin } : undefined}
        />

        {badge}

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-bone/85 p-2 text-ink-soft opacity-0 shadow-card backdrop-blur-sm transition-all hover:text-ink group-hover:opacity-100 focus-visible:opacity-100"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-bone/85 p-2 text-ink-soft opacity-0 shadow-card backdrop-blur-sm transition-all hover:text-ink group-hover:opacity-100 focus-visible:opacity-100"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                <path d="M10 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <span className="absolute bottom-3 left-3 bg-bone/85 px-2.5 py-1 text-[11px] tabular-nums text-ink-soft backdrop-blur-sm">
              {Math.min(index, count - 1) + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label="Product images">
          {images.map((image, position) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={position === index}
              aria-label={`Show image ${position + 1}`}
              onClick={() => setIndex(position)}
              className={`h-20 w-16 shrink-0 overflow-hidden border bg-bone-100 transition-all ${
                position === index
                  ? 'border-ink'
                  : 'border-line opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={image.url}
                alt=""
                width={160}
                height={200}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
