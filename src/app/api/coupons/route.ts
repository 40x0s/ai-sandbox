import { NextResponse } from 'next/server'
import { z } from 'zod'
import { validateCoupon } from '@/lib/coupons'

const schema = z.object({
  code: z.string().trim().max(40),
  subtotal: z.coerce.number().int().min(0).max(10_000_000),
})

/** Instant feedback for the checkout coupon box. The orders API re-validates. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 422 })
  }

  const result = await validateCoupon(parsed.data.code, parsed.data.subtotal)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 })
  }

  return NextResponse.json(result)
}
