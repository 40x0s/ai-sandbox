'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'

/**
 * Recently viewed products — same external-store pattern as the cart so the
 * localStorage copy cannot cause a hydration mismatch.
 */

export type RecentItem = { id: string; slug: string; name: string; imageUrl: string; price: number }

const STORAGE_KEY = 'atelier.recent.v1'
const MAX_ITEMS = 8
const EMPTY: { items: RecentItem[]; hydrated: boolean } = { items: [], hydrated: false }

let snapshot = EMPTY
const listeners = new Set<() => void>()

function read(): RecentItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item): item is RecentItem =>
          !!item && typeof item === 'object' && typeof (item as RecentItem).id === 'string',
      )
      .slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

function commit(items: RecentItem[], hydrated: boolean) {
  snapshot = { items, hydrated }
  if (hydrated) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage unavailable — keep the in-memory list for this session
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

export function RecentProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (snapshot.hydrated) return
    commit(read(), true)
  }, [])

  return children
}

export function useRecentlyViewed() {
  const { items, hydrated } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return useMemo(
    () => ({
      items,
      hydrated,
      record: (item: RecentItem) => {
        // Idempotent: if this product is already the most recent, do nothing,
        // so a mount effect cannot loop.
        if (items[0]?.id === item.id) return
        commit(
          [item, ...items.filter((existing) => existing.id !== item.id)].slice(0, MAX_ITEMS),
          true,
        )
      },
      clear: () => commit([], true),
    }),
    [items, hydrated],
  )
}
