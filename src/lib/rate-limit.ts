/**
 * Minimal fixed-window rate limiter for the auth endpoints.
 *
 * In-memory, so it is per server instance and resets on restart — enough to blunt
 * a brute-force attempt against one deployment, not a substitute for an edge or
 * Redis-backed limiter on a multi-instance production setup.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { ok: true, retryAfterSeconds: 0 }
}

/** Test/maintenance helper. */
export function resetRateLimits() {
  buckets.clear()
}
