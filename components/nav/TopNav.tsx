import Logo from './Logo'

export default function TopNav() {
  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] z-nav bg-surface border-b border-border flex items-center px-8">
      <Logo />
    </header>
  )
}
