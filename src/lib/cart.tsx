'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { shippingFor } from './pricing'

export { FLAT_SHIPPING, FREE_SHIPPING_THRESHOLD } from './pricing'

export type CartItem = {
  /** `${productId}:${size}:${color}` — the same product in two sizes is two lines */
  key: string
  productId: string
  slug: string
  name: string
  imageUrl: string
  /** Unit price in cents, captured when the item was added */
  price: number
  size: string
  color: string
  colorHex: string
  quantity: number
  maxQuantity: number
}

export type AddToCartInput = Omit<CartItem, 'key'>

const STORAGE_KEY = 'atelier.cart.v1'

type Snapshot = { items: CartItem[]; hydrated: boolean }

const EMPTY: Snapshot = { items: [], hydrated: false }

/* ------------------------------------------------------------------ *
 * Module-level store. `useSyncExternalStore` subscribes to it, which is
 * the supported way to mirror an external system (localStorage) into
 * React — and it avoids setState-in-effect hydration pitfalls.
 * ------------------------------------------------------------------ */

let snapshot: Snapshot = EMPTY
const listeners = new Set<() => void>()

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is CartItem =>
        !!item && typeof item === 'object' && typeof (item as CartItem).key === 'string',
    )
  } catch {
    return [] // corrupt data, private mode, or storage disabled
  }
}

function commit(next: Snapshot, persist: boolean) {
  snapshot = next
  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.items))
    } catch {
      // Quota exceeded or storage unavailable — the in-memory cart still works.
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

/* ----------------------------- actions ----------------------------- */

export const cartItemKey = (productId: string, size: string, color: string) =>
  `${productId}:${size}:${color}`

function addItem(input: AddToCartInput) {
  const key = cartItemKey(input.productId, input.size, input.color)
  const existing = snapshot.items.find((item) => item.key === key)

  const items = existing
    ? snapshot.items.map((item) =>
        item.key === key
          ? {
              ...item,
              price: input.price,
              maxQuantity: input.maxQuantity,
              quantity: Math.min(item.quantity + input.quantity, input.maxQuantity),
            }
          : item,
      )
    : [...snapshot.items, { ...input, key, quantity: Math.min(input.quantity, input.maxQuantity) }]

  commit({ items, hydrated: true }, true)
}

function removeItem(key: string) {
  commit({ items: snapshot.items.filter((item) => item.key !== key), hydrated: true }, true)
}

function setQuantity(key: string, quantity: number) {
  const items =
    quantity <= 0
      ? snapshot.items.filter((item) => item.key !== key)
      : snapshot.items.map((item) =>
          item.key === key ? { ...item, quantity: Math.min(quantity, item.maxQuantity) } : item,
        )
  commit({ items, hydrated: true }, true)
}

function clearCart() {
  commit({ items: [], hydrated: true }, true)
}

/* ---------------------------- provider ----------------------------- */

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Pull the persisted cart in after mount: the server render and the first
  // client render both use the empty snapshot, so hydration always matches.
  useEffect(() => {
    if (snapshot.hydrated) return
    commit({ items: readStorage(), hydrated: true }, false)
  }, [])

  return children
}

export type CartApi = Snapshot & {
  count: number
  subtotal: number
  shipping: number
  total: number
  addItem: typeof addItem
  removeItem: typeof removeItem
  setQuantity: typeof setQuantity
  clearCart: typeof clearCart
}

export function useCart(): CartApi {
  const { items, hydrated } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return {
      items,
      hydrated,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      shipping: shippingFor(subtotal),
      total: subtotal + shippingFor(subtotal),
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    }
  }, [items, hydrated])
}
