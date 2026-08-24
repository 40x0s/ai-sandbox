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
}

export default nextConfig
