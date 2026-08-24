import type { MetadataRoute } from 'next'
import { getAllProductSlugs } from '@/lib/products'

// Regenerated per request so new products appear without a rebuild.
export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProductSlugs()

  return [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/catalog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/catalog?category=women`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/catalog?category=men`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/catalog?category=kids`, changeFrequency: 'weekly', priority: 0.7 },
    ...products.map((product) => ({
      url: `${BASE}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
