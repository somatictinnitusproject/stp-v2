'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Tracker', href: '/tracker' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Library', href: '/exercise-library' },
  { label: 'Community', href: '/community' },
]

export default function NavLinks() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <nav className="flex items-center gap-7">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive(link.href) ? 'page' : undefined}
          className={`text-[13px] font-medium no-underline transition-colors ${
            isActive(link.href) ? 'text-primary' : 'text-text-muted hover:text-text-body'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
