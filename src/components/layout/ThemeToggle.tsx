'use client'

import { useEffect, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'
type Snapshot = { theme: Theme | null }

const STORAGE_KEY = 'atelier.theme'
const SERVER_SNAPSHOT: Snapshot = { theme: null }

/**
 * Module-level theme store, subscribed to with `useSyncExternalStore`.
 * The class on <html> is applied by an inline script in <head> before first
 * paint (no flash); this store only reads and writes user intent afterwards.
 */
let snapshot: Snapshot = SERVER_SNAPSHOT
const listeners = new Set<() => void>()

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => snapshot
const getServerSnapshot = () => SERVER_SNAPSHOT

function setTheme(theme: Theme) {
  snapshot = { theme }
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // storage unavailable — the choice still applies for this session
  }
  for (const listener of listeners) listener()
}

export function ThemeToggle() {
  const { theme } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Adopt the already-applied theme. Writing to the external store (not React
  // state) keeps this an external-system sync rather than a cascading render.
  useEffect(() => {
    if (snapshot.theme) return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const resolved = stored === 'light' || stored === 'dark' ? stored : systemTheme()
    snapshot = { theme: resolved }
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    for (const listener of listeners) listener()
  }, [])

  if (!theme) {
    // Server render / pre-hydration: a labelled, disabled placeholder so the
    // control is still announced instead of vanishing from the a11y tree.
    return (
      <button
        type="button"
        disabled
        aria-label="Theme"
        className="h-10 w-10 rounded-full p-2.5 text-ink-soft"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <circle cx="12" cy="12" r="4" />
        </svg>
      </button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-bone-100 hover:text-ink"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
