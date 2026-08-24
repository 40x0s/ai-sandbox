import Link from 'next/link'
import { NewsletterForm } from './NewsletterForm'

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'Women', href: '/catalog?category=women' },
      { label: 'Men', href: '/catalog?category=men' },
      { label: 'Kids', href: '/catalog?category=kids' },
      { label: 'Sale', href: '/catalog?sale=1' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Create account', href: '/register' },
      { label: 'Your cart', href: '/cart' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-bone-100/60">
      <div className="container-x grid gap-12 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <p className="text-lg font-semibold tracking-[0.24em] uppercase">Atelier</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-stone">
            Considered clothing made from natural fibres — designed to be worn often, repaired
            easily and kept for years, not seasons.
          </p>
          <p className="eyebrow mt-8 text-stone">The ATELIER letter</p>
          <p className="mt-1 text-sm text-stone">New drops and restocks, once a month.</p>
          <NewsletterForm />
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="eyebrow text-stone">{col.title}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-soft transition-colors hover:text-clay"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-3 px-4 py-6 text-xs text-stone sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} ATELIER. Demo storefront built with Next.js, Prisma and SQLite.</p>
          <p className="tracking-[0.12em] uppercase">Visa · Mastercard · Amex · Apple Pay</p>
        </div>
      </div>
    </footer>
  )
}
