'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export default function UserMenu({ username }: { username: string }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  // sheetMounted controls DOM presence; sheetVisible drives the CSS transform
  const [sheetMounted, setSheetMounted] = useState(false)
  const [sheetVisible, setSheetVisible] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const reducedMotion = useReducedMotion()

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Escape key dismisses bottom sheet
  useEffect(() => {
    if (!sheetMounted) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSheet()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sheetMounted])

  function openSheet() {
    setSheetMounted(true)
    if (reducedMotion) {
      setSheetVisible(true)
      return
    }
    // Two rAF calls ensure the element is painted before the transition fires
    requestAnimationFrame(() => requestAnimationFrame(() => setSheetVisible(true)))
  }

  function closeSheet() {
    if (reducedMotion) {
      setSheetVisible(false)
      setSheetMounted(false)
      return
    }
    setSheetVisible(false)
    setTimeout(() => setSheetMounted(false), 250)
  }

  async function handleSignOut() {
    setDropdownOpen(false)
    closeSheet()
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop dropdown */}
      <div ref={dropdownRef} className="hidden md:block relative">
        <button
          onClick={() => setDropdownOpen(v => !v)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-text-body hover:text-text-heading transition-colors"
        >
          @{username}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-[180px] bg-surface border border-border rounded-lg shadow-dropdown z-modal overflow-hidden">
            <Link
              href="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center h-10 px-4 text-[13px] text-text-body hover:bg-surface-raised transition-colors"
            >
              My profile
            </Link>
            <Link
              href="/programme-overview"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center h-10 px-4 text-[13px] text-text-body hover:bg-surface-raised transition-colors"
            >
              Programme overview
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full h-10 px-4 text-[13px] text-error hover:bg-surface-raised transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Mobile: username tap → bottom sheet */}
      <div className="md:hidden min-w-0 flex justify-end">
        <button
          onClick={openSheet}
          className="text-[13px] font-medium text-text-body truncate max-w-[140px] overflow-hidden whitespace-nowrap block"
        >
          @{username}
        </button>

        {sheetMounted && (
          <>
            <div
              className="fixed inset-0 z-overlay"
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                opacity: sheetVisible ? 1 : 0,
                transition: reducedMotion ? 'none' : 'opacity 300ms ease-out',
              }}
              onClick={closeSheet}
            />
            <div
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[16px] z-modal"
              style={{
                transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)',
                transition: reducedMotion
                  ? 'none'
                  : sheetVisible
                  ? 'transform 300ms ease-out'
                  : 'transform 250ms ease-in',
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-8 h-1 rounded-full bg-border" />
              </div>
              <Link
                href="/profile"
                onClick={closeSheet}
                className="flex items-center h-12 px-6 text-[15px] text-text-body hover:bg-surface-raised transition-colors"
              >
                My profile
              </Link>
              <Link
                href="/programme-overview"
                onClick={closeSheet}
                className="flex items-center h-12 px-6 text-[15px] text-text-body hover:bg-surface-raised transition-colors"
              >
                Programme overview
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full h-12 px-6 text-[15px] text-error hover:bg-surface-raised transition-colors mb-2"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
