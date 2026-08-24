import Link from 'next/link'

type Props = {
  title: string
  step: string
  description: string
}

/**
 * Temporary placeholder for routes that exist in the navigation but whose
 * feature is built in a later step. Each one is replaced by the real screen —
 * nothing here is permanent.
 */
export function ComingSoon({ title, step, description }: Props) {
  return (
    <div className="container-x px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="eyebrow text-clay">{step}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-lg text-stone">{description}</p>
      <Link
        href="/"
        className="mt-8 inline-flex border border-ink/25 px-6 py-3 text-xs tracking-[0.16em] uppercase transition-colors hover:border-ink hover:bg-ink hover:text-bone"
      >
        Back to home
      </Link>
    </div>
  )
}
