import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'
import { registerSchema } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid details' },
      { status: 422 },
    )
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local'
  const throttle = rateLimit(`register:${ip}`, { limit: 5, windowMs: 10 * 60_000 })
  if (!throttle.ok) {
    return NextResponse.json(
      { error: `Too many accounts created from this address. Try again in ${throttle.retryAfterSeconds}s.` },
      { status: 429 },
    )
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: 'An account with that email already exists' },
      { status: 409 },
    )
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hash(password, 10),
      role: 'CUSTOMER',
    },
  })

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: 'CUSTOMER',
  })

  return NextResponse.json({ ok: true, role: user.role, name: user.name }, { status: 201 })
}
