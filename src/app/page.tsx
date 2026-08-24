import { getCategoriesWithCounts, getFeaturedProducts } from '@/lib/products'
import { Hero } from '@/components/home/Hero'
import { PromoBanners } from '@/components/home/PromoBanners'
import { CategoryStrip } from '@/components/home/CategoryStrip'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { ValueProps } from '@/components/home/ValueProps'

// The catalogue is editable from the admin dashboard, so render on request
// rather than baking the product list in at build time.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(4),
    getCategoriesWithCounts(),
  ])

  return (
    <>
      <Hero />
      <PromoBanners />
      <CategoryStrip categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <ValueProps />
    </>
  )
}
