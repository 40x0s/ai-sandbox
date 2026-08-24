import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@/components/ui/icons'

const banners = [
  {
    href: '/catalog?category=women',
    eyebrow: 'Womenswear',
    title: 'Softness, structured',
    copy: 'Silk, wool and washed linen in earthy tones.',
    image: '/images/banner-womenswear.jpg',
    cta: 'Shop women',
  },
  {
    href: '/catalog?category=men',
    eyebrow: 'Menswear',
    title: 'Built for the everyday',
    copy: 'Selvedge denim, heavy knits and layered outerwear.',
    image: '/images/banner-menswear.jpg',
    cta: 'Shop men',
  },
]

export function PromoBanners() {
  return (
    <section className="container-x mt-20 px-4 sm:mt-28 sm:px-6 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-2">
        {banners.map((banner) => (
          <Link
            key={banner.href}
            href={banner.href}
            className="group relative block min-h-[26rem] overflow-hidden bg-bone-100 sm:min-h-[32rem]"
          >
            <Image
              src={banner.image}
              alt={`${banner.eyebrow} campaign`}
              width={768}
              height={1376}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 text-bone sm:p-8">
              <p className="eyebrow text-bone/80">{banner.eyebrow}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                {banner.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm text-bone/85">{banner.copy}</p>
              <span className="mt-5 inline-flex items-center gap-2 border-b border-bone/50 pb-1 text-xs tracking-[0.16em] uppercase transition-colors group-hover:border-clay group-hover:text-clay">
                {banner.cta}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
