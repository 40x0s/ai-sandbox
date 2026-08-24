import { ComingSoon } from '@/components/ui/ComingSoon'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: slug.replace(/-/g, ' ') }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  return (
    <ComingSoon
      step="Step 5"
      title={`Product details — “${slug.replace(/-/g, ' ')}”`}
      description="Gallery, description, size and colour selectors, stock state and Add to Cart."
    />
  )
}
