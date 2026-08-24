import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@/components/ui/icons'

export function Hero() {
  return (
    <section className="container-x px-4 pt-8 sm:px-6 lg:px-8 lg:pt-14">
      <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="flex flex-col justify-center py-8 lg:py-16">
          <p className="eyebrow text-clay">Autumn / Winter 2026</p>

          <h1 className="mt-5 text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.03em] text-balance sm:text-6xl lg:text-[4.25rem]">
            Clothes worth
            <br />
            keeping.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-stone sm:text-lg">
            Natural fibres, honest construction and cuts that outlast the trend cycle. Shop
            considered essentials for men, women and kids.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/catalog"
              className="group inline-flex items-center gap-2 bg-ink px-7 py-3.5 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay"
            >
              Shop the collection
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/catalog?category=women"
              className="inline-flex items-center border border-ink/25 px-7 py-3.5 text-xs tracking-[0.16em] uppercase transition-colors hover:border-ink hover:bg-ink hover:text-bone"
            >
              New in womenswear
            </Link>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-8">
            {[
              { value: '120+', label: 'Natural fibres' },
              { value: '30-day', label: 'Free returns' },
              { value: '4.8/5', label: 'Customer rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-xl font-semibold tracking-tight">{stat.value}</dd>
                <dd className="mt-1 text-xs text-stone">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative min-h-[24rem] overflow-hidden bg-bone-100 lg:min-h-[38rem]">
          <Image
            src="/images/hero-editorial.jpg"
            alt="Model wearing a beige trench coat in a bright studio"
            width={1264}
            height={848}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-5 left-5 bg-bone/90 px-5 py-4 backdrop-blur-sm">
            <p className="eyebrow text-stone">The trench, reworked</p>
            <p className="mt-1 text-sm font-medium">From $148</p>
          </div>
        </div>
      </div>
    </section>
  )
}
