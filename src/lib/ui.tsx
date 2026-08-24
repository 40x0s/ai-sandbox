'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Global UI state: the slide-over cart drawer and the toast stack. Kept in one
 * provider so any component (header, product page, product card) can open the
 * drawer or raise a toast without prop drilling.
 */

export type ToastAction = { label: string; onClick: () => void }
export type Toast = { id: number; message: string; action?: ToastAction }

type UiValue = {
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toasts: Toast[]
  notify: (message: string, action?: ToastAction) => void
  dismiss: (id: number) => void
}

const UiContext = createContext<UiValue | null>(null)

let nextToastId = 0
const TOAST_TTL = 3800

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, action?: ToastAction) => {
      const id = ++nextToastId
      setToasts((current) => [...current.slice(-2), { id, message, action }])
      setTimeout(() => dismiss(id), TOAST_TTL)
    },
    [dismiss],
  )

  const openCart = useCallback(() => setCartOpen(true), [])
  const closeCart = useCallback(() => setCartOpen(false), [])

  const value = useMemo(
    () => ({ cartOpen, openCart, closeCart, toasts, notify, dismiss }),
    [cartOpen, openCart, closeCart, toasts, notify, dismiss],
  )

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi(): UiValue {
  const context = useContext(UiContext)
  if (!context) throw new Error('useUi must be used inside <UiProvider>')
  return context
}

/** Fixed toast stack, bottom-right (bottom-center on small screens). */
export function Toaster() {
  const { toasts, dismiss } = useUi()

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm items-center gap-3 border border-ink/10 bg-ink px-4 py-3 text-sm text-bone shadow-lift animate-[toast-in_180ms_ease-out]"
        >
          <span className="flex-1">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick()
                dismiss(toast.id)
              }}
              className="shrink-0 text-xs tracking-[0.14em] text-clay uppercase underline"
            >
              {toast.action.label}
            </button>
          )}
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismiss(toast.id)}
            className="shrink-0 text-bone/60 transition-colors hover:text-bone"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

/** Locks page scroll while a drawer/dialog is open. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [active])
}
