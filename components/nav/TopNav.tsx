import Logo from './Logo'
import NavLinks from './NavLinks'
import UserMenu from './UserMenu'
import { createClient } from '@/lib/supabase/server'

export default async function TopNav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let username = ''
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()
    username = data?.display_name ?? ''
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] z-nav bg-surface border-b border-border">
      {/* Desktop: Logo left | NavLinks absolutely centred | UserMenu right */}
      <div className="hidden md:flex items-center h-full px-8 max-w-[1120px] mx-auto relative">
        <Logo href="/dashboard" />
        <div className="absolute left-1/2 -translate-x-1/2">
          <NavLinks />
        </div>
        <div className="ml-auto">
          <UserMenu username={username} />
        </div>
      </div>

      {/* Mobile: Logo left | Username right (truncates on long names) */}
      <div className="flex md:hidden items-center justify-between h-full px-4">
        <div className="flex-shrink-0">
          <Logo href="/dashboard" />
        </div>
        <div className="min-w-0 flex-1 flex justify-end">
          <UserMenu username={username} />
        </div>
      </div>
    </header>
  )
}
