'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'

/** Comparison tray store — up to 4 products, persisted to localStorage. */

export type CompareItem = { id: string; slug: string; name: string; imageUrl: string }

export const COMPARE_LIMIT = 4

const STORAGE_KEY = 'atelier.compare.v1'
const EMPTY: { items: CompareItem[]; hydrated: boolean } = { items: [], hydrated: false }

let snapshot = EMPTY
const listeners = new Set<() => void>()

function read(): CompareItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item): item is CompareItem =>
          !!item && typeof item === 'object' && typeof (item as CompareItem).id === 'string',
      )
      .slice(0, COMPARE_LIMIT)
  } catch {
    return []
  }
}

function commit(items: CompareItem[], hydrated: boolean) {
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

export function CompareProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (snapshot.hydrated) return
    commit(read(), true)
  }, [])

  return children
}

export type CompareResult = {
  ok: boolean
  reason?: 'full' | 'duplicate'
}

export function useCompare() {
  const { items, hydrated } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return useMemo(
    () => ({
      items,
      hydrated,
      count: items.length,
      has: (id: string) => items.some((item) => item.id === id),
      toggle: (item: CompareItem): CompareResult => {
        if (items.some((existing) => existing.id === item.id)) {
          commit(
            items.filter((existing) => existing.id !== item.id),
            true,
          )
          return { ok: true }
        }
        if (items.length >= COMPARE_LIMIT) return { ok: false, reason: 'full' }
        commit([...items, item], true)
        return { ok: true }
      },
      clear: () => commit([], true),
    }),
    [items, hydrated],
  )
}
