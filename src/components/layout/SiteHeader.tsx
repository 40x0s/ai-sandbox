import Link from 'next/link'
import { AccountNav } from './AccountNav'
import { BagButton } from './BagButton'
import { MobileMenu } from './MobileMenu'
import { SearchBox } from './SearchBox'
import { WishlistMenu } from './WishlistMenu'

const primaryNav = [
  { label: 'Women', href: '/catalog?category=women' },
  { label: 'Men', href: '/catalog?category=men' },
  { label: 'Kids', href: '/catalog?category=kids' },
  { label: 'Sale', href: '/catalog?sale=1' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      {/* Announcement bar */}
      <div className="bg-ink text-bone">
        <p className="container-x flex h-9 items-center justify-center gap-2 px-4 text-center text-[11px] tracking-[0.14em] uppercase sm:px-6 lg:px-8">
          Complimentary shipping over $75 · 30-day returns · New season live now
        </p>
      </div>

      {/* Main bar */}
      <div className="border-b border-line bg-bone/85 backdrop-blur-md supports-[backdrop-filter]:bg-bone/70">
        <div className="container-x flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <MobileMenu />

          <Link
            href="/"
            className="shrink-0 text-xl font-semibold tracking-[0.24em] uppercase transition-opacity hover:opacity-70"
          >
            Atelier
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-ink-soft transition-colors hover:text-clay"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden flex-1 justify-center px-4 md:flex md:max-w-md">
            <SearchBox />
          </div>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <div className="hidden sm:block">
              <WishlistMenu />
            </div>
            <AccountNav />
            <BagButton />
          </div>
        </div>
      </div>
    </header>
  )
}
