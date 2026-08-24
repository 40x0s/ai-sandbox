'use client'

import { useEffect, useRef } from 'react'

/**
 * Fades + lifts its children into view on scroll. Content is visible without
 * JavaScript (see the <noscript> override) and with reduced motion.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'li' | 'article'
}) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Toggling a class on the observed node is a DOM update, not a re-render.
    if (typeof IntersectionObserver === 'undefined') {
      element.classList.add('reveal-shown')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.classList.add('reveal-shown')
            observer.disconnect()
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
    </Tag>
  )
}
