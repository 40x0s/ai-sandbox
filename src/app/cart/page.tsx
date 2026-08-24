import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata = { title: 'Cart' }

export default function CartPage() {
  return (
    <ComingSoon
      step="Step 5"
      title="Your cart"
      description="Line items, quantity controls and totals, backed by a Cart context persisted to localStorage."
    />
  )
}
