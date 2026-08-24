import { LeafIcon, ReturnIcon, ShieldIcon, TruckIcon } from '@/components/ui/icons'

const props = [
  { icon: TruckIcon, title: 'Free shipping', copy: 'On every order over $75' },
  { icon: ReturnIcon, title: '30-day returns', copy: 'Free and no questions asked' },
  { icon: ShieldIcon, title: 'Secure checkout', copy: 'Encrypted, card or wallet' },
  { icon: LeafIcon, title: 'Natural fibres', copy: 'Traceable, certified mills' },
]

export function ValueProps() {
  return (
    <section className="mt-20 border-y border-line bg-bone-100/60 sm:mt-28">
      <ul className="container-x grid gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {props.map(({ icon: Icon, title, copy }) => (
          <li key={title} className="flex items-start gap-4">
            <Icon className="mt-0.5 h-6 w-6 shrink-0 text-clay" />
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-1 text-sm text-stone">{copy}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
