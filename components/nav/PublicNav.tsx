import Link from 'next/link'
import Logo from './Logo'

export default function PublicNav() {
  return (
    <header className="h-[60px] flex items-center justify-between px-4 md:px-8 border-b border-border bg-surface">
      <Logo />
      <nav className="flex items-center gap-6">
        <Link
          href="/login"
          className="text-[13px] font-medium text-text-body hover:text-primary transition-colors duration-150"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="text-[13px] font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors duration-150"
        >
          Get started
        </Link>
      </nav>
    </header>
  )
}
