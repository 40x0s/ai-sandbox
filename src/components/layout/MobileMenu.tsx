'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useScrollLock } from '@/lib/ui'
import { SearchBox } from './SearchBox'

const links = [
  { label: 'Women', href: '/catalog?category=women' },
  { label: 'Men', href: '/catalog?category=men' },
  { label: 'Kids', href: '/catalog?category=kids' },
  { label: 'Sale', href: '/catalog?sale=1' },
  { label: 'All products', href: '/catalog' },
]

/** Off-canvas navigation for small screens, with search included. */
export function MobileMenu() {
  const [open, setOpen] = useState(false)

  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-bone-100 hover:text-ink md:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-[fade-in_160ms_ease-out]"
          />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-xs flex-col bg-bone shadow-lift animate-[drawer-in-left_240ms_cubic-bezier(0.22,1,0.36,1)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="text-sm tracking-[0.24em] uppercase">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-2 text-stone transition-colors hover:bg-bone-100 hover:text-ink"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-4">
              <SearchBox />
            </div>

            <nav className="flex-1 overflow-y-auto px-5 pb-6">
              <ul className="divide-y divide-line">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block py-3.5 text-base transition-colors hover:text-clay"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
