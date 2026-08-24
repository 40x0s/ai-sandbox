import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata = { title: 'Sign in' }
export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const params = await searchParams
  const next = Array.isArray(params.next) ? params.next[0] : params.next

  const session = await getSession()
  if (session) redirect(next && next.startsWith('/') ? next : '/')

  return (
    <div className="container-x px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <p className="eyebrow text-clay">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-3 text-sm text-stone">
          New here?{' '}
          <Link href="/register" className="underline hover:text-ink">
            Create an account
          </Link>
        </p>

        <div className="mt-8">
          <AuthForm mode="login" next={next} />
        </div>

        <div className="mt-8 border-t border-line pt-6 text-xs text-stone">
          <p className="font-medium text-ink-soft">Demo accounts</p>
          <p className="mt-2">
            Admin — <code className="font-mono">admin@store.test</code> /{' '}
            <code className="font-mono">admin123</code>
          </p>
          <p className="mt-1">
            Customer — <code className="font-mono">demo@store.test</code> /{' '}
            <code className="font-mono">demo123</code>
          </p>
        </div>
      </div>
    </div>
  )
}
