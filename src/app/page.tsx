import { getCategoriesWithCounts, getFeaturedProducts } from '@/lib/products'
import { Hero } from '@/components/home/Hero'
import { PromoBanners } from '@/components/home/PromoBanners'
import { CategoryStrip } from '@/components/home/CategoryStrip'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { ValueProps } from '@/components/home/ValueProps'
import { Reveal } from '@/components/ui/Reveal'

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
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal>
        <PromoBanners />
      </Reveal>
      <Reveal>
        <CategoryStrip categories={categories} />
      </Reveal>
      <Reveal>
        <FeaturedProducts products={featuredProducts} />
      </Reveal>
      <Reveal>
        <ValueProps />
      </Reveal>
    </>
  )
}
