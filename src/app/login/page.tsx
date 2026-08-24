import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <ComingSoon
      step="Step 7"
      title="Sign in"
      description="Email + password authentication against the User table, with a signed session cookie issued by an API route."
    />
  )
}
