import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

const reviewSchema = z.object({
  productId: z.string().min(1),
  author: z.string().trim().min(2, 'Enter your name').max(60),
  rating: z.coerce.number().int().min(1, 'Pick a rating').max(5),
  title: z.string().trim().max(120).default(''),
  body: z.string().trim().min(10, 'Tell us a little more (min 10 characters)').max(1000),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local'
  const throttle = rateLimit(`review:${ip}`, { limit: 5, windowMs: 10 * 60_000 })
  if (!throttle.ok) {
    return NextResponse.json(
      { error: `Too many reviews from this address. Try again in ${throttle.retryAfterSeconds}s.` },
      { status: 429 },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid review' },
      { status: 422 },
    )
  }

  const data = parsed.data
  const product = await prisma.product.findUnique({ where: { id: data.productId } })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const review = await prisma.review.create({
    data: {
      productId: data.productId,
      author: data.author,
      rating: data.rating,
      title: data.title,
      body: data.body,
    },
  })

  // Keep the denormalised summary on the product in sync with its reviews.
  const aggregate = await prisma.review.aggregate({
    where: { productId: data.productId },
    _avg: { rating: true },
    _count: true,
  })

  await prisma.product.update({
    where: { id: data.productId },
    data: {
      rating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
      reviewCount: aggregate._count,
    },
  })

  return NextResponse.json({ ok: true, review }, { status: 201 })
}
