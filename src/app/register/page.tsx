import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata = { title: 'Create account' }

export default function RegisterPage() {
  return (
    <ComingSoon
      step="Step 7"
      title="Create account"
      description="Registration with a hashed password (bcrypt) and a validated payload (zod)."
    />
  )
}
