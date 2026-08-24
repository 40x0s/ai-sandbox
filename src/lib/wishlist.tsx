'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'

/**
 * Wishlist (favourites). Stores just enough product data to render the header
 * dropdown without another request. Uses the same external-store pattern as the
 * cart so the localStorage copy never causes a hydration mismatch.
 */

export type WishlistItem = {
  id: string
  slug: string
  name: string
  imageUrl: string
  price: number
}

const STORAGE_KEY = 'atelier.wishlist.v1'
const EMPTY: { items: WishlistItem[]; hydrated: boolean } = { items: [], hydrated: false }

let snapshot = EMPTY
const listeners = new Set<() => void>()

function read(): WishlistItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is WishlistItem =>
        !!item && typeof item === 'object' && typeof (item as WishlistItem).id === 'string',
    )
  } catch {
    return []
  }
}

function commit(items: WishlistItem[], hydrated: boolean) {
  snapshot = { items, hydrated }
  if (hydrated) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage unavailable — the in-memory wishlist still works this session
    }
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => snapshot
const getServerSnapshot = () => EMPTY

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (snapshot.hydrated) return
    commit(read(), true)
  }, [])

  return children
}

export function useWishlist() {
  const { items, hydrated } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return useMemo(
    () => ({
      items,
      hydrated,
      count: items.length,
      has: (productId: string) => items.some((item) => item.id === productId),
      toggle: (item: WishlistItem) =>
        commit(
          items.some((existing) => existing.id === item.id)
            ? items.filter((existing) => existing.id !== item.id)
            : [...items, item],
          true,
        ),
      clear: () => commit([], true),
    }),
    [items, hydrated],
  )
}
