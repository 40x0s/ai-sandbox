import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-x px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="eyebrow text-clay">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        This page has been discontinued
      </h1>
      <p className="mx-auto mt-4 max-w-md text-stone">
        The piece you are looking for is no longer here — but the collection is not going anywhere.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/catalog"
          className="bg-ink px-7 py-3.5 text-xs tracking-[0.16em] text-bone uppercase transition-colors hover:bg-clay"
        >
          Shop the collection
        </Link>
        <Link
          href="/"
          className="border border-ink/25 px-7 py-3.5 text-xs tracking-[0.16em] uppercase transition-colors hover:border-ink hover:bg-ink hover:text-bone"
        >
          Back home
        </Link>
      </div>
    </div>
  )
}
