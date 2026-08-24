/**
 * Seed the dev database with a small but realistic catalogue.
 * Run with: npm run db:seed   (npx tsx prisma/seed.ts)
 * Idempotent — safe to re-run.
 */
import { hash } from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

const categories = [
  { name: 'Men', slug: 'men' },
  { name: 'Women', slug: 'women' },
  { name: 'Kids', slug: 'kids' },
]

const colors = [
  { name: 'White', slug: 'white', hex: '#F4F1EA' },
  { name: 'Black', slug: 'black', hex: '#17181A' },
  { name: 'Navy', slug: 'navy', hex: '#1F2A44' },
  { name: 'Indigo', slug: 'indigo', hex: '#3A4A6B' },
  { name: 'Cream', slug: 'cream', hex: '#F0E6D6' },
  { name: 'Mustard', slug: 'mustard', hex: '#D9A441' },
  { name: 'Olive', slug: 'olive', hex: '#6B7A4B' },
  { name: 'Oatmeal', slug: 'oatmeal', hex: '#E3D8C3' },
  { name: 'Charcoal', slug: 'charcoal', hex: '#3A3A3C' },
]

const sizes = [
  { label: 'XS', sort: 1 },
  { label: 'S', sort: 2 },
  { label: 'M', sort: 3 },
  { label: 'L', sort: 4 },
  { label: 'XL', sort: 5 },
  { label: '2Y', sort: 6 },
  { label: '4Y', sort: 7 },
  { label: '6Y', sort: 8 },
  { label: '8Y', sort: 9 },
]

type SeedProduct = {
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  imageUrl: string
  stock: number
  featured: boolean
  rating: number
  reviewCount: number
  category: string
  colors: string[]
  sizes: string[]
}

const products: SeedProduct[] = [
  {
    slug: 'essential-cotton-tee',
    name: 'Essential Heavyweight Tee',
    description:
      'A 240gsm combed-cotton tee with a structured shoulder and a neckline that keeps its shape wash after wash. Cut slightly boxy so it layers cleanly under knitwear or stands on its own.',
    price: 3200,
    compareAtPrice: 4200,
    imageUrl: '/images/products/essential-tee.jpg',
    stock: 120,
    featured: true,
    rating: 4.7,
    reviewCount: 214,
    category: 'men',
    colors: ['white', 'black', 'navy'],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    slug: 'classic-denim-jacket',
    name: 'Heritage Denim Jacket',
    description:
      'Rigid 13oz Japanese selvedge denim, copper hardware and a cropped trucker silhouette that softens into your own fade. Unlined, so it works from first frost through early spring.',
    price: 12800,
    compareAtPrice: 15800,
    imageUrl: '/images/products/denim-jacket.jpg',
    stock: 38,
    featured: true,
    rating: 4.8,
    reviewCount: 96,
    category: 'men',
    colors: ['indigo'],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    slug: 'meadow-floral-midi-dress',
    name: 'Meadow Floral Midi Dress',
    description:
      'A bias-cut wrap dress in printed viscose with a self-tie waist and a midi hem that moves. Fully lined through the bodice, finished with covered buttons.',
    price: 14800,
    imageUrl: '/images/products/floral-dress.jpg',
    stock: 54,
    featured: true,
    rating: 4.6,
    reviewCount: 143,
    category: 'women',
    colors: ['cream'],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    slug: 'little-explorer-hoodie',
    name: 'Little Explorer Hoodie',
    description:
      'Brushed organic-cotton fleece with reinforced elbow patches, a kangaroo pocket and a lined hood. Pre-washed for softness and sized with room to grow.',
    price: 4500,
    compareAtPrice: 5600,
    imageUrl: '/images/products/kids-hoodie.jpg',
    stock: 76,
    featured: true,
    rating: 4.9,
    reviewCount: 61,
    category: 'kids',
    colors: ['mustard'],
    sizes: ['2Y', '4Y', '6Y', '8Y'],
  },
  {
    slug: 'coastal-linen-shirt',
    name: 'Coastal Linen Shirt',
    description:
      'Washed European linen with a camp collar, single patch pocket and a relaxed body. Breathable enough for high summer, smart enough for dinner after.',
    price: 8800,
    imageUrl: '/images/products/linen-shirt.jpg',
    stock: 45,
    featured: false,
    rating: 4.5,
    reviewCount: 88,
    category: 'men',
    colors: ['olive', 'white'],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    slug: 'cable-knit-sweater',
    name: 'Cable Knit Wool Sweater',
    description:
      'Chunky hand-frame cable knit in undyed lambswool. Dropped shoulders, ribbed cuffs and a weight that holds its shape through a full winter.',
    price: 11200,
    compareAtPrice: 13900,
    imageUrl: '/images/products/knit-sweater.jpg',
    stock: 29,
    featured: true,
    rating: 4.8,
    reviewCount: 172,
    category: 'women',
    colors: ['oatmeal', 'charcoal'],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    slug: 'tailored-wool-trousers',
    name: 'Tailored Pleated Trousers',
    description:
      'High-rise single-pleat trousers in a dry Italian wool twill. Wide through the thigh, gently tapered, with side adjusters instead of belt loops.',
    price: 13500,
    imageUrl: '/images/products/wool-trousers.jpg',
    stock: 33,
    featured: false,
    rating: 4.4,
    reviewCount: 57,
    category: 'women',
    colors: ['charcoal', 'navy'],
    sizes: ['XS', 'S', 'M', 'L'],
  },
]

async function main() {
  console.log('Seeding database…')

  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c })
  }
  for (const c of colors) {
    await prisma.color.upsert({ where: { slug: c.slug }, update: c, create: c })
  }
  for (const s of sizes) {
    await prisma.size.upsert({ where: { label: s.label }, update: s, create: s })
  }

  for (const p of products) {
    const data = {
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      imageUrl: p.imageUrl,
      stock: p.stock,
      featured: p.featured,
      rating: p.rating,
      reviewCount: p.reviewCount,
      category: { connect: { slug: p.category } },
      colors: { connect: p.colors.map((slug) => ({ slug })) },
      sizes: { connect: p.sizes.map((label) => ({ label })) },
    }
    await prisma.product.upsert({ where: { slug: p.slug }, update: data, create: { slug: p.slug, ...data } })
  }

  // Demo accounts — passwords are hashed, never stored in plain text.
  const users = [
    { name: 'Store Admin', email: 'admin@store.test', password: 'admin123', role: 'ADMIN' },
    { name: 'Demo Customer', email: 'demo@store.test', password: 'demo123', role: 'CUSTOMER' },
  ]
  for (const u of users) {
    const passwordHash = await hash(u.password, 10)
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role, name: u.name },
      create: { name: u.name, email: u.email, passwordHash, role: u.role },
    })
    console.log(`  user ${u.email} / ${u.password} (${u.role})`)
  }

  const counts = {
    products: await prisma.product.count(),
    categories: await prisma.category.count(),
    colors: await prisma.color.count(),
    sizes: await prisma.size.count(),
    users: await prisma.user.count(),
  }
  console.log('Seed complete:', counts)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
