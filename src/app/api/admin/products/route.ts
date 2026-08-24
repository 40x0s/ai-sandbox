import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, replaceGallery, validateTaxonomyRefs } from '@/lib/admin'
import { productFormSchema } from '@/lib/validators-admin'

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = productFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid product' },
      { status: 422 },
    )
  }

  const data = parsed.data

  const slugTaken = await prisma.product.findUnique({ where: { slug: data.slug } })
  if (slugTaken) {
    return NextResponse.json({ error: 'That slug is already in use' }, { status: 409 })
  }

  const refError = await validateTaxonomyRefs(data)
  if (refError) return NextResponse.json({ error: refError }, { status: 422 })

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: Math.round(data.price * 100),
      compareAtPrice:
        typeof data.compareAtPrice === 'number' ? Math.round(data.compareAtPrice * 100) : null,
      imageUrl: data.imageUrl,
      stock: data.stock,
      featured: data.featured ?? false,
      category: { connect: { id: data.categoryId } },
      sizes: { connect: data.sizeLabels.map((label) => ({ label })) },
      colors: { connect: data.colorSlugs.map((slug) => ({ slug })) },
    },
  })

  await replaceGallery(product.id, data.imageUrl, data.imageUrls)

  return NextResponse.json({ ok: true, product }, { status: 201 })
}
