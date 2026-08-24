import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, replaceGallery, validateTaxonomyRefs } from '@/lib/admin'
import { productFormSchema } from '@/lib/validators-admin'

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: Context) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await request.json().catch(() => null)
  const parsed = productFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid product' },
      { status: 422 },
    )
  }

  const data = parsed.data

  const slugOwner = await prisma.product.findUnique({ where: { slug: data.slug } })
  if (slugOwner && slugOwner.id !== id) {
    return NextResponse.json({ error: 'That slug is already in use' }, { status: 409 })
  }

  const refError = await validateTaxonomyRefs(data)
  if (refError) return NextResponse.json({ error: refError }, { status: 422 })

  const product = await prisma.product.update({
    where: { id },
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
      // Replace the option sets wholesale so removals are honoured.
      sizes: { set: data.sizeLabels.map((label) => ({ label })) },
      colors: { set: data.colorSlugs.map((slug) => ({ slug })) },
    },
  })

  await replaceGallery(product.id, data.imageUrl, data.imageUrls)

  return NextResponse.json({ ok: true, product })
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
  }

  const { id } = await context.params

  // Check first so the happy path never throws: order lines reference products.
  const referencedBy = await prisma.orderItem.count({ where: { productId: id } })
  if (referencedBy > 0) {
    return NextResponse.json(
      {
        error: `This product appears on ${referencedBy} existing order line(s), so it cannot be deleted. Set stock to 0 instead.`,
      },
      { status: 409 },
    )
  }

  try {
    await prisma.product.delete({ where: { id } })
  } catch (error) {
    // P2003 = foreign key constraint: the product appears on existing orders.
    if ((error as { code?: string }).code === 'P2003') {
      return NextResponse.json(
        { error: 'This product is on existing orders, so it cannot be deleted. Set stock to 0 instead.' },
        { status: 409 },
      )
    }
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    throw error
  }

  return NextResponse.json({ ok: true })
}
