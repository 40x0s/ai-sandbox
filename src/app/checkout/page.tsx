import { CheckoutForm } from '@/components/checkout/CheckoutForm'

export const metadata = { title: 'Checkout' }

export default function CheckoutPage() {
  return (
    <div className="container-x px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-line pb-6">
        <p className="eyebrow text-clay">Step 2 of 2</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Checkout</h1>
        <p className="mt-2 text-sm text-stone">
          Simulated payment — nothing is charged, but the order is saved and stock is updated.
        </p>
      </header>

      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  )
}
