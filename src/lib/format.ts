/**
 * Money is stored as integer cents everywhere in this app (see schema.prisma)
 * so we never accumulate float rounding errors on totals.
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

export function discountPercent(priceCents: number, compareAtCents: number | null): number | null {
  if (!compareAtCents || compareAtCents <= priceCents) return null
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100)
}
