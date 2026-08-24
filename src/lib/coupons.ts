import { prisma } from './prisma'

export type CouponCheck =
  | { ok: true; code: string; percentOff: number; discount: number }
  | { ok: false; error: string }

/**
 * Validates a coupon against an order subtotal. Called by both the checkout UI
 * (for instant feedback) and the orders API (which is the one that counts).
 */
export async function validateCoupon(code: string, subtotalCents: number): Promise<CouponCheck> {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return { ok: false, error: 'Enter a code first.' }

  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } })

  if (!coupon || !coupon.active) {
    return { ok: false, error: 'That code is not valid.' }
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: 'That code has expired.' }
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, error: 'That code has reached its usage limit.' }
  }

  return {
    ok: true,
    code: coupon.code,
    percentOff: coupon.percentOff,
    discount: Math.round((subtotalCents * coupon.percentOff) / 100),
  }
}

export async function getCoupons() {
  return prisma.coupon.findMany({ orderBy: { code: 'asc' } })
}
