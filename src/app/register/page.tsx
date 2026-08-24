import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata = { title: 'Create account' }
export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const session = await getSession()
  if (session) redirect('/')

  return (
    <div className="container-x px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <p className="eyebrow text-clay">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-3 text-sm text-stone">
          Already have one?{' '}
          <Link href="/login" className="underline hover:text-ink">
            Sign in
          </Link>
        </p>

        <div className="mt-8">
          <AuthForm mode="register" />
        </div>
      </div>
    </div>
  )
}
