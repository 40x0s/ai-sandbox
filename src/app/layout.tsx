import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { CartProvider } from '@/lib/cart'
import { WishlistProvider } from '@/lib/wishlist'
import { CompareProvider } from '@/lib/compare'
import { RecentProvider } from '@/lib/recent'
import { Toaster, UiProvider } from '@/lib/ui'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { CompareTray } from '@/components/layout/CompareTray'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
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
    <html lang="en" className={`${GeistSans.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Runs before first paint so dark mode never flashes white. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('atelier.theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <UiProvider>
          <CompareProvider>
          <RecentProvider>
          <WishlistProvider>
            <CartProvider>
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
            </CartProvider>
          </WishlistProvider>
          </RecentProvider>
          </CompareProvider>

          <CartDrawer />
          <CompareTray />
          <Toaster />
        </UiProvider>
      </body>
    </html>
  )
}
