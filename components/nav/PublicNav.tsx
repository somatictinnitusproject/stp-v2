import Link from 'next/link'
import Logo from './Logo'

export default function PublicNav() {
  return (
    <header className="h-[60px] flex items-center justify-between px-4 md:px-8 border-b border-border bg-surface">
      <div className="flex-shrink-0">
        <Logo />
      </div>
      <nav className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/login"
          className="hidden min-[380px]:inline-flex text-[13px] font-medium text-text-body hover:text-primary transition-colors duration-150 whitespace-nowrap"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="text-[13px] font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors duration-150 whitespace-nowrap"
        >
          Get started
        </Link>
      </nav>
    </header>
  )
}
