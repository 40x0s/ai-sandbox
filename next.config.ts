import type { NextConfig } from 'next'

/**
 * Security headers.
 *
 * Framing is blocked by default. Set ALLOW_IFRAME_EMBED=1 only when the app is
 * deliberately embedded in an iframe on another domain (for example a sandbox
 * live preview) — that is the one case where `frame-ancestors 'none'` would
 * break the page.
 *
 * NOTE: next.config.ts is evaluated at BUILD time, so this must be set when
 * `next build` runs — not merely at runtime. The Docker image never sets it,
 * so production builds always ship the strict headers.
 *
 * The CSP allows 'unsafe-inline' for script/style because Next.js emits inline
 * bootstrap scripts and this app uses inline style props. Tighten it by moving
 * to Next's nonce-based CSP before handling real customer data.
 */
const embedded = process.env.ALLOW_IFRAME_EMBED === '1'

const contentSecurityPolicy = [
  "default-src 'self'",
  // React needs eval() for its development-only error decoding. Production
  // builds never call eval, so the allowance is limited to development.
  `script-src 'self' 'unsafe-inline'${
    process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"
  }`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  embedded ? "frame-ancestors *" : "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Ignored by browsers over plain http; harmless in development.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  ...(embedded ? [] : [{ key: 'X-Frame-Options', value: 'DENY' }]),
]

const nextConfig: NextConfig = {
  images: {
    // Seed images live in /public/images. Uncomment (and narrow) this if you
    // swap `imageUrl` values for a hosted CDN instead of local files.
    // remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },

  // The sandbox preview is served from https://<port>-<id>.e2b.app. Without this,
  // Next blocks /_next/* requests from that origin and the page loads unstyled
  // and without interactivity. Harmless in a local/production deployment.
  allowedDevOrigins: ['*.e2b.app'],

  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
