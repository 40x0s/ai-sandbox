import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Seed images live in /public/images. Uncomment (and narrow) this if you
    // swap `imageUrl` values for a hosted CDN instead of local files.
    // remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
}

export default nextConfig
