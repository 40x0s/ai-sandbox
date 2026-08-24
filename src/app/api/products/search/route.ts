import { NextResponse } from 'next/server'
import { searchProducts } from '@/lib/products'

/**
 * Live search endpoint for the header. `mode` is a no-op on SQLite but the
 * `contains` match is case-insensitive by default for ASCII in SQLite.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim()
  const take = Math.min(Number(searchParams.get('take') ?? 6) || 6, 20)

  if (q.length < 2) {
    return NextResponse.json({ query: q, results: [] })
  }

  const results = await searchProducts(q, take)
  return NextResponse.json({ query: q, results })
}
