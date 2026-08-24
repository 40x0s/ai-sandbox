'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type Taxonomies = {
  categories: { id: string; name: string }[]
  sizes: { id: string; label: string }[]
  colors: { id: string; name: string; slug: string; hex: string }[]
}

export type ProductDraft = {
  id: string
  name: string
  slug: string
  description: string
  price: number // dollars
  compareAtPrice: number | null // dollars
  imageUrl: string
  stock: number
  featured: boolean
  categoryId: string
  sizeLabels: string[]
  colorSlugs: string[]
}

type Props = {
  taxonomies: Taxonomies
  product?: ProductDraft
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export function ProductForm({ taxonomies, product }: Props) {
  const router = useRouter()
  const isEdit = Boolean(product)

  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice ? String(product.compareAtPrice) : '',
  )
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '/images/products/essential-tee.jpg')
  const [stock, setStock] = useState(product ? String(product.stock) : '10')
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? taxonomies.categories[0]?.id ?? '')
  const [sizeLabels, setSizeLabels] = useState<string[]>(product?.sizeLabels ?? [])
  const [colorSlugs, setColorSlugs] = useState<string[]>(product?.colorSlugs ?? [])
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const inputClass =
    'w-full border border-line bg-transparent px-3 py-2.5 text-sm focus:border-ink focus:outline-none'
  const labelClass = 'eyebrow text-stone'

  function toggle(list: string[], value: string, setList: (next: string[]) => void) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    const payload = {
      name,
      slug: slugTouched ? slug : slugify(name),
      description,
      price: Number(price),
      compareAtPrice: compareAtPrice === '' ? '' : Number(compareAtPrice),
      imageUrl,
      stock: Number(stock),
      featured,
      categoryId,
      sizeLabels,
      colorSlugs,
    }

    try {
      const response = await fetch(
        isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error ?? 'Could not save the product.')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-4xl gap-10 lg:grid-cols-[1fr_16rem]">
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (!slugTouched) setSlug(slugify(event.target.value))
            }}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug (URL)
          </label>
          <input
            id="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true)
              setSlug(slugify(event.target.value))
            }}
            required
            className={`${inputClass} font-mono`}
          />
          <p className="mt-1 text-xs text-stone">/products/{slug || '…'}</p>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            minLength={10}
            rows={5}
            className={inputClass}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="price" className={labelClass}>
              Price (USD)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="compareAtPrice" className={labelClass}>
              Compare at (optional)
            </label>
            <input
              id="compareAtPrice"
              type="number"
              step="0.01"
              min="0"
              value={compareAtPrice}
              onChange={(event) => setCompareAtPrice(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="stock" className={labelClass}>
              Stock
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="imageUrl" className={labelClass}>
            Image URL
          </label>
          <input
            id="imageUrl"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            required
            className={`${inputClass} font-mono text-xs`}
          />
          <div className="mt-3 h-32 w-26 overflow-hidden border border-line bg-bone-100">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL
              <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
            )}
          </div>
        </div>

        <div>
          <label htmlFor="categoryId" className={labelClass}>
            Category
          </label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={inputClass}
          >
            {taxonomies.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className={labelClass}>Sizes</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {taxonomies.sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                aria-pressed={sizeLabels.includes(size.label)}
                onClick={() => toggle(sizeLabels, size.label, setSizeLabels)}
                className={`border px-3 py-1.5 text-sm transition-colors ${
                  sizeLabels.includes(size.label)
                    ? 'border-ink bg-ink text-bone'
                    : 'border-line hover:border-ink/40'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={labelClass}>Colours</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {taxonomies.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                aria-pressed={colorSlugs.includes(color.slug)}
                onClick={() => toggle(colorSlugs, color.slug, setColorSlugs)}
                className={`flex items-center gap-2 border px-3 py-1.5 text-sm transition-colors ${
                  colorSlugs.includes(color.slug) ? 'border-ink' : 'border-line hover:border-ink/40'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full ring-1 ring-ink/15"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
            className="h-4 w-4 accent-[var(--color-clay)]"
          />
          Show in “Featured products” on the home page
        </label>

        {error && (
          <p role="alert" className="border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="bg-ink px-8 py-3.5 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay disabled:opacity-50"
          >
            {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="border border-line px-6 py-3.5 text-xs tracking-[0.16em] uppercase transition-colors hover:border-ink"
          >
            Cancel
          </button>
        </div>
      </div>

      <aside className="h-fit border border-line bg-white/60 p-5 text-xs text-stone lg:sticky lg:top-8">
        <p className="font-medium text-ink">Tips</p>
        <ul className="mt-3 space-y-2 leading-relaxed">
          <li>Prices are entered in dollars and stored as integer cents.</li>
          <li>
            Images: keep files in <code className="font-mono">public/images/products</code> and
            reference them as <code className="font-mono">/images/products/file.jpg</code>.
          </li>
          <li>Setting stock to 0 marks the product sold out on the storefront.</li>
        </ul>
      </aside>
    </form>
  )
}
