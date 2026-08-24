import Link from 'next/link'
import { ArrowRightIcon } from '@/components/ui/icons'

type Props = {
  categories: { slug: string; name: string; productCount: number }[]
}

export function CategoryStrip({ categories }: Props) {
  return (
    <section className="container-x mt-20 px-4 sm:mt-28 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-stone">Shop by</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Category</h2>
        </div>
        <Link
          href="/catalog"
          className="group hidden items-center gap-2 text-xs tracking-[0.16em] uppercase transition-colors hover:text-clay sm:inline-flex"
        >
          View all
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/catalog?category=${category.slug}`}
              className="group flex items-center justify-between border border-line bg-bone-100/60 px-6 py-7 transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-card"
            >
              <span>
                <span className="block text-lg font-medium tracking-tight">{category.name}</span>
                <span className="mt-1 block text-sm text-stone">
                  {category.productCount} {category.productCount === 1 ? 'piece' : 'pieces'}
                </span>
              </span>
              <ArrowRightIcon className="h-5 w-5 text-stone transition-all group-hover:translate-x-1 group-hover:text-clay" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
