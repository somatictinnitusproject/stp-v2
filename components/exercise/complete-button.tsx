'use client'

// /components/exercise/complete-button.tsx
// Non-timer Complete button. Calls onComplete (a Server Action or API caller)
// with pending-state guard. Parent handles post-complete transition (M13g).

import { useState } from 'react'

interface CompleteButtonProps {
  onComplete: () => Promise<void>
  label?: string
}

export function CompleteButton({ onComplete, label = 'Complete' }: CompleteButtonProps) {
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    if (pending) return
    setPending(true)
    try {
      await onComplete()
      // No success UI — parent (M13g) handles transition.
    } catch (err) {
      // Optimistic UI pattern: silent failure acceptable for session writes.
      console.error('Complete button error', err)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="w-full min-h-[44px] py-3 px-4 bg-primary text-white rounded-lg text-body font-medium hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Completing…' : label}
    </button>
  )
}

export default CompleteButton
