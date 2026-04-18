'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const PUBLIC_PATHS = ['/', '/login', '/signup', '/reset-password', '/terms', '/privacy', '/test']

export default function SessionExpiryModal() {
  const [show, setShow] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Only show on protected routes — public routes don't have a session to expire
      const isPublic =
        PUBLIC_PATHS.includes(pathname) ||
        pathname.startsWith('/reset-password')

      if (event === 'SIGNED_OUT' && !isPublic) {
        setShow(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-overlay flex items-center justify-center px-4">
      <div className="bg-surface rounded-xl shadow-modal max-w-[480px] w-full p-8 z-modal">
        <h2 className="text-[24px] font-semibold text-text-heading mb-3">
          Your session has ended
        </h2>
        <p className="text-[16px] text-text-body mb-8">
          You&apos;ve been logged out due to inactivity. Please log in again to continue.
        </p>
        <button
          onClick={() => {
            setShow(false)
            router.push('/login')
          }}
          className="w-full bg-primary text-white font-medium text-[15px] py-3 rounded-lg hover:bg-primary-hover active:bg-primary-active transition-colors duration-150"
        >
          Log in again
        </button>
      </div>
    </div>
  )
}
