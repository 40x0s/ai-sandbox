import { getTaxonomies } from '@/lib/admin'
import { ProductForm } from '@/components/admin/ProductForm'

export const metadata = { title: 'New product' }
export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const taxonomies = await getTaxonomies()

  return (
    <>
      <h2 className="text-xl font-semibold tracking-tight">New product</h2>
      <div className="mt-6">
        <ProductForm taxonomies={taxonomies} />
      </div>
    </>
  )
}
