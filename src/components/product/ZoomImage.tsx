'use client'

import Image from 'next/image'
import { useState } from 'react'

/**
 * Product image with cursor-following zoom. Degrades to a plain image when the
 * pointer can't hover (touch devices keep the subtle scale-on-tap feel).
 */
export function ZoomImage({
  src,
  alt,
  width,
  height,
  badge,
}: {
  src: string
  alt: string
  width: number
  height: number
  badge?: React.ReactNode
}) {
  const [origin, setOrigin] = useState<string | null>(null)

  return (
    <div
      className="group relative aspect-4/5 cursor-zoom-in overflow-hidden bg-bone-100"
      onMouseMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - box.left) / box.width) * 100
        const y = ((event.clientY - box.top) / box.height) * 100
        setOrigin(`${x}% ${y}%`)
      }}
      onMouseLeave={() => setOrigin(null)}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.9]"
        style={origin ? { transformOrigin: origin } : undefined}
      />
      {badge}
    </div>
  )
}
