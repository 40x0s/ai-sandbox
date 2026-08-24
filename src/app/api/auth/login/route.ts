import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'
import { credentialsSchema } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'

function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local'
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = credentialsSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid details' },
      { status: 422 },
    )
  }

  const { email, password } = parsed.data

  // Blunt-force protection: 8 attempts per email+IP every 5 minutes.
  const throttle = rateLimit(`login:${clientIp(request)}:${email}`, {
    limit: 8,
    windowMs: 5 * 60_000,
  })
  if (!throttle.ok) {
    return NextResponse.json(
      { error: `Too many sign-in attempts. Try again in ${throttle.retryAfterSeconds}s.` },
      { status: 429 },
    )
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Same message for "no such user" and "wrong password" — no user enumeration.
  if (!user || !(await compare(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 })
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
  })

  return NextResponse.json({ ok: true, role: user.role, name: user.name })
}
