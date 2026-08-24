/** Shipping rules shared by the cart UI (client) and the orders API (server). */

export const FREE_SHIPPING_THRESHOLD = 7500 // $75.00
export const FLAT_SHIPPING = 695 // $6.95

export function shippingFor(subtotalCents: number): number {
  if (subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD) return 0
  return FLAT_SHIPPING
}
