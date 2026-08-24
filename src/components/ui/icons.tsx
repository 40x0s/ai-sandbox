/** Inline SVG icon set — no icon dependency, tree-shakeable, currentColor. */

type IconProps = React.SVGProps<SVGSVGElement>

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function BagIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9.5 8V6.5a2.5 2.5 0 0 1 5 0V8" />
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.4 3.6-5 7-5s6.2 1.6 7 5" />
    </svg>
  )
}

export function TruckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </svg>
  )
}

export function ReturnIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10a8 8 0 1 1 1.5 8" />
      <path d="M4 5v5h5" />
    </svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v5.5c0 4-2.9 7.6-7 9.5-4.1-1.9-7-5.5-7-9.5V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function LeafIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 4c0 9-5.5 13-11 13H5c0-7 5-11 11-11 1.5 0 3-1 4-2Z" />
      <path d="M5 20c2-5 5-8 9-10" />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5Z" />
    </svg>
  )
}
