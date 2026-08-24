import { SignJWT, jwtVerify } from 'jose'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Session handling: a signed HS256 JWT in an httpOnly cookie.
 * No server-side session table needed for this demo — the token is the session.
 */

export const SESSION_COOKIE = 'atelier_session'
const DEV_FALLBACK_SECRET = 'dev-only-change-me-please-32-chars-min'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * Signing key. Refuses to run in production with the placeholder secret — a
 * leaked signing key means anyone can mint an admin session.
 */
function signingKey(): Uint8Array {
  const value = process.env.AUTH_SECRET ?? ''
  const weak = !value || value.includes('dev-only-change-me') || value.length < 32

  if (process.env.NODE_ENV === 'production' && weak) {
    throw new Error(
      'AUTH_SECRET must be set to your own value of at least 32 characters in production ' +
        '(generate one with: openssl rand -base64 32).',
    )
  }

  return new TextEncoder().encode(weak ? DEV_FALLBACK_SECRET : value)
}

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
 * `Secure` is required over HTTPS and by `SameSite=None`.
 *
 * `SameSite=None` is used ONLY when the app is genuinely embedded cross-site
 * (the sandbox preview iframe, or an explicit opt-in flag) — a Lax cookie is
 * not sent on cross-site subresource requests, so login would appear to work
 * and then every later request would arrive with no session. Everywhere else we
 * keep `Lax`, which is also what gives the app its browser-level CSRF defence;
 * weakening it in production would be a security regression.
 */
async function sessionCookieFlags() {
  const requestHeaders = await headers()
  const forwardedProto = (requestHeaders.get('x-forwarded-proto') ?? '').split(',')[0].trim()
  const host = requestHeaders.get('host') ?? ''

  const secure =
    process.env.NODE_ENV === 'production' ||
    forwardedProto === 'https' ||
    host.endsWith('.e2b.app') // sandbox live-preview proxy

  const crossSiteEmbed = host.endsWith('.e2b.app') || process.env.COOKIE_SAMESITE_NONE === '1'

  return { secure, sameSite: crossSiteEmbed ? ('none' as const) : ('lax' as const) }
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
    .sign(signingKey())

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
    const { payload } = await jwtVerify(token, signingKey())
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
