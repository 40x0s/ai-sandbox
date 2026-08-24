import Link from 'next/link'
import { BagIcon, SearchIcon, UserIcon } from '@/components/ui/icons'

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
        <div className="container-x flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-semibold tracking-[0.24em] uppercase transition-opacity hover:opacity-70"
          >
            Atelier
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
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

          <div className="flex items-center gap-1">
            <Link
              href="/catalog"
              aria-label="Search products"
              className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-bone-100 hover:text-ink"
            >
              <SearchIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              aria-label="Sign in"
              className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-bone-100 hover:text-ink"
            >
              <UserIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              aria-label="View cart"
              className="relative rounded-full p-2.5 text-ink-soft transition-colors hover:bg-bone-100 hover:text-ink"
            >
              <BagIcon className="h-5 w-5" />
              {/* Cart count badge is wired to the cart context in the cart step. */}
            </Link>
          </div>
        </div>

        {/* Mobile category row (scrollable, no JS required) */}
        <nav
          aria-label="Categories"
          className="flex gap-6 overflow-x-auto border-t border-line px-4 py-2.5 md:hidden"
        >
          {primaryNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="shrink-0 text-sm text-ink-soft transition-colors hover:text-clay"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
