import type { NextConfig } from 'next'

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
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Only useful over HTTPS; browsers ignore it on http.
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // NOTE: no X-Frame-Options / frame-ancestors CSP on purpose — the app is
          // embedded in the Arena preview iframe. Add
          //   { key: 'X-Frame-Options', value: 'DENY' }
          // once it is deployed standalone, and add a Content-Security-Policy
          // built around Next's nonce support.
        ],
      },
    ]
  },
}

export default nextConfig
