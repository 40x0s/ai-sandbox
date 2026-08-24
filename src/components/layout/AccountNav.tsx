import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { UserIcon } from '@/components/ui/icons'
import { SignOutButton } from './SignOutButton'

/**
 * Server component: reads the session cookie and renders either a sign-in
 * affordance or the signed-in account row (plus an Admin link for admins).
 */
export async function AccountNav() {
  const session = await getSession()

  if (!session) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-bone-100 hover:text-ink"
      >
        <UserIcon className="h-5 w-5" />
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3 pl-2">
      <Link
        href="/account/orders"
        className="hidden text-sm text-ink-soft transition-colors hover:text-clay lg:inline"
      >
        Orders
      </Link>
      {session.role === 'ADMIN' && (
        <Link
          href="/admin"
          className="hidden border border-line px-3 py-1.5 text-xs tracking-[0.12em] uppercase transition-colors hover:border-ink hover:bg-ink hover:text-bone sm:inline-block"
        >
          Admin
        </Link>
      )}
      <span className="hidden max-w-32 truncate text-sm text-ink-soft sm:inline">
        {session.name.split(' ')[0]}
      </span>
      <SignOutButton />
    </div>
  )
}
