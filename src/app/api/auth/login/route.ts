import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'
import { credentialsSchema } from '@/lib/validators'

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
