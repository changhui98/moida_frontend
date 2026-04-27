import { useId, type SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const BASE: IconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

export function BrandLogo(props: IconProps) {
  const rawId = useId()
  const gradId = `sagwim-pinGrad-${rawId.replace(/:/g, '')}`
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      aria-hidden
      focusable={false}
      {...props}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8A65" />
          <stop offset="100%" stopColor="#FF5252" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        d="M128 20 C76 20 38 58 38 108 C38 170 128 236 128 236 C128 236 218 170 218 108 C218 58 180 20 128 20 Z"
      />
      <g stroke="white" strokeWidth="4" strokeLinecap="round" opacity={0.55}>
        <line x1="100" y1="92" x2="156" y2="92" />
        <line x1="100" y1="92" x2="128" y2="138" />
        <line x1="156" y1="92" x2="128" y2="138" />
      </g>
      <g fill="white">
        <circle cx="100" cy="92" r="14" />
        <circle cx="156" cy="92" r="14" />
        <circle cx="128" cy="138" r="14" />
      </g>
    </svg>
  )
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function PeopleIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
      <circle cx="17" cy="8" r="2.6" />
      <path d="M15.5 13.2c2.5.3 4.5 1.9 4.5 4.3" />
    </svg>
  )
}

export function PlusSquareIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

export function UserCircleIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M5.5 19c1.2-2.6 3.8-4 6.5-4s5.3 1.4 6.5 4" />
    </svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 3 4 6v6c0 4.6 3.2 8.4 8 9 4.8-.6 8-4.4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </svg>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  )
}

export function ActivityIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3 12h4l3-7 4 14 3-7h4" />
    </svg>
  )
}

export function BookmarkIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M6 4h12v17l-6-4-6 4Z" />
    </svg>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SwitchIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M17 4 21 8l-4 4" />
      <path d="M3 8h18" />
      <path d="M7 20 3 16l4-4" />
      <path d="M21 16H3" />
    </svg>
  )
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h12" />
      <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
    </svg>
  )
}

export function GroupIcon(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
