import { notFound } from 'next/navigation'
import { getAdminProduct, getTaxonomies } from '@/lib/admin'
import { ProductForm } from '@/components/admin/ProductForm'

export const metadata = { title: 'Edit product' }
export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, taxonomies] = await Promise.all([getAdminProduct(id), getTaxonomies()])

  if (!product) notFound()

  return (
    <>
      <h2 className="text-xl font-semibold tracking-tight">Edit product</h2>
      <div className="mt-6">
        <ProductForm
          taxonomies={taxonomies}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price / 100,
            compareAtPrice: product.compareAtPrice === null ? null : product.compareAtPrice / 100,
            imageUrl: product.imageUrl,
            stock: product.stock,
            featured: product.featured,
            categoryId: product.categoryId,
            sizeLabels: product.sizes.map((size) => size.label),
            colorSlugs: product.colors.map((color) => color.slug),
          }}
        />
      </div>
    </>
  )
}
