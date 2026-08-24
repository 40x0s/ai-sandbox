import { SignJWT, jwtVerify } from 'jose'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Session handling: a signed HS256 JWT in an httpOnly cookie.
 * No server-side session table needed for this demo — the token is the session.
 */

export const SESSION_COOKIE = 'atelier_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? 'dev-only-change-me-please-32-chars-min',
)

export type Role = 'CUSTOMER' | 'ADMIN'

export type Session = {
  userId: string
  email: string
  name: string
  role: Role
}

/**
 * Cookie attributes depend on how the app is being served.
 *
 * A `SameSite=Lax` cookie is NOT sent on cross-site subresource requests, which
 * is exactly what happens when the storefront is embedded in a preview iframe on
 * another domain — login succeeds, the cookie is issued, and then every later
 * request arrives without it. Over HTTPS we therefore use `SameSite=None;
 * Secure` (the Secure flag is mandatory for None). Plain http://localhost keeps
 * the stricter `Lax`, since browsers reject `None` without `Secure`.
 */
async function sessionCookieFlags() {
  const requestHeaders = await headers()
  const forwardedProto = (requestHeaders.get('x-forwarded-proto') ?? '').split(',')[0].trim()
  const host = requestHeaders.get('host') ?? ''

  const secure =
    process.env.NODE_ENV === 'production' ||
    forwardedProto === 'https' ||
    host.endsWith('.e2b.app') // sandbox live-preview proxy

  return { secure, sameSite: secure ? ('none' as const) : ('lax' as const) }
}

export async function createSession(session: Session): Promise<void> {
  const token = await new SignJWT({
    email: session.email,
    name: session.name,
    role: session.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret)

  const { secure, sameSite } = await sessionCookieFlags()
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite,
    secure,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    if (!payload.sub) return null
    return {
      userId: payload.sub,
      email: String(payload.email ?? ''),
      name: String(payload.name ?? ''),
      role: payload.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
    }
  } catch {
    return null // expired, tampered or signed with a different secret
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/** For pages: redirects to /login when there is no session. */
export async function requireUser(): Promise<Session> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

/** For the admin dashboard and its API routes. */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login?next=/admin')
  return session
}
