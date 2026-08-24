import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'ATELIER — Considered clothing for every day',
    template: '%s · ATELIER',
  },
  description:
    'ATELIER is a modern clothing store: considered essentials for men, women and kids, made from natural fibres and built to last.',
  openGraph: {
    title: 'ATELIER — Considered clothing for every day',
    description: 'Considered essentials for men, women and kids.',
    images: ['/images/hero-editorial.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-bone"
        >
          Skip to content
        </a>

        <SiteHeader />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  )
}
