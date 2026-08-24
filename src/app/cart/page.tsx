import { CartView } from '@/components/cart/CartView'

export const metadata = { title: 'Your bag' }

export default function CartPage() {
  return (
    <div className="container-x px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-line pb-6">
        <p className="eyebrow text-clay">Step 1 of 2</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your bag</h1>
      </header>

      <div className="mt-8">
        <CartView />
      </div>
    </div>
  )
}
